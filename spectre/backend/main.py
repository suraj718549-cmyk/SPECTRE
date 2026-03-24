from fastapi import FastAPI, BackgroundTasks, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import uuid
import asyncio
import os
from dotenv import load_dotenv
from sse_starlette.sse import EventSourceResponse
import json
from typing import Any

# Load environment variables from .env file
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

from database import engine, SessionLocal, Base
import models
from modules import recon, scanner, vuln_analyzer, ai_engine, report_gen

app = FastAPI(title="SPECTRE AI Autonomous Penetration Testing Bot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ScanRequest(BaseModel):
    target: str
    is_demo: bool = True
    consent: bool = False

scan_status_queues: dict[str, asyncio.Queue] = {}


def _queue_message(scan_id: str, payload: dict[str, Any]):
    queue = scan_status_queues.get(scan_id)
    if queue:
        return queue.put(payload)
    return None

@app.post("/start-scan")
async def start_scan(request: ScanRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if not request.consent:
        raise HTTPException(status_code=400, detail="Consent is strictly required to perform scans.")

    target = request.target.strip() or "demo-target.local"
    if request.is_demo:
        target = "demo-target.local"

    scan_id = str(uuid.uuid4())

    db_scan = models.Scan(id=scan_id, target=target, status="started")
    db.add(db_scan)
    db.commit()

    scan_status_queues[scan_id] = asyncio.Queue()
    background_tasks.add_task(run_scan_pipeline, scan_id, target, request.is_demo)

    return {"scan_id": scan_id, "target": target, "message": "Scan initiated."}


async def run_scan_pipeline(scan_id: str, target: str, is_demo: bool):
    queue = scan_status_queues.get(scan_id)
    db = SessionLocal()

    try:
        await queue.put({"phase": "phase", "status": "running", "message": "Recon phase engaged", "step": "recon"})
        recon_data = await recon.perform_recon(target, is_demo, queue)

        await queue.put({"phase": "phase", "status": "running", "message": "Scan phase engaged", "step": "scan"})
        scan_data = await scanner.perform_scan(target, is_demo, queue)

        await queue.put({"phase": "phase", "status": "running", "message": "Exploit analysis engaged", "step": "exploit"})
        vuln_data = await vuln_analyzer.analyze(recon_data, scan_data, is_demo, queue)

        await queue.put({"phase": "phase", "status": "running", "message": "Report generation engaged", "step": "report"})
        ai_narrative = await ai_engine.generate_narrative(vuln_data, is_demo, queue)

        cvss_values = [v.get("cvss", 0) for v in vuln_data]
        threat_score = int(min(100, sum(cvss_values) / max(1, len(cvss_values)) * 10))

        results_payload = {
            "target": target,
            "threat_score": threat_score,
            "recon": recon_data,
            "scan": scan_data,
            "vulns": vuln_data,
            "ai_narrative": ai_narrative,
        }

        db_scan = db.query(models.Scan).filter(models.Scan.id == scan_id).first()
        if db_scan:
            db_scan.status = "completed"
            db_scan.results = json.dumps(results_payload)
            db.commit()

        await queue.put({"phase": "complete", "status": "done", "message": "Scan completed successfully.", "results": results_payload})

    except Exception as e:
        if queue:
            await queue.put({"phase": "error", "status": "failed", "message": str(e)})
        db_scan = db.query(models.Scan).filter(models.Scan.id == scan_id).first()
        if db_scan:
            db_scan.status = "failed"
            db.commit()
    finally:
        db.close()

@app.get("/scan-status/{scan_id}")
async def get_scan_status(scan_id: str):
    queue = scan_status_queues.get(scan_id)
    if not queue:
         raise HTTPException(status_code=404, detail="Scan ID not found or not active.")

    async def event_generator():
        try:
            while True:
                data = await queue.get()
                yield {"data": json.dumps(data)}
                if data.get("phase") in ["complete", "error"]:
                    break
        except asyncio.CancelledError:
            pass
        finally:
            scan_status_queues.pop(scan_id, None)

    return EventSourceResponse(event_generator())

@app.get("/results/{scan_id}")
def get_results(scan_id: str, db: Session = Depends(get_db)):
    db_scan = db.query(models.Scan).filter(models.Scan.id == scan_id).first()
    if not db_scan:
        raise HTTPException(status_code=404, detail="Scan not found.")
    
    if db_scan.status != "completed":
        return {"status": db_scan.status}
        
    return {"status": "completed", "data": json.loads(db_scan.results)}

@app.get("/health")
def health():
    nvd_key = os.getenv("NVD_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    
    return {
        "status": "ok", 
        "mode": "live-ready",
        "api_keys": {
            "nvd": "configured" if nvd_key else "missing",
            "groq": "configured" if groq_key else "missing",
            "openai": "configured" if openai_key else "missing", 
            "anthropic": "configured" if anthropic_key else "missing"
        }
    }

@app.get("/report/{scan_id}")
def get_report(scan_id: str, db: Session = Depends(get_db)):
    db_scan = db.query(models.Scan).filter(models.Scan.id == scan_id).first()
    if not db_scan or db_scan.status != "completed":
        raise HTTPException(status_code=404, detail="Report not ready or scan not found.")
        
    results = json.loads(db_scan.results)
    pdf_path = report_gen.generate_pdf(scan_id, db_scan.target, results)
    
    from fastapi.responses import FileResponse
    return FileResponse(pdf_path, filename=f"SPECTRE_Report_{db_scan.target.replace('.', '_')}.pdf")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
