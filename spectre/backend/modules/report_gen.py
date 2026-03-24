from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas


def generate_pdf(scan_id: str, target: str, results: dict) -> str:
    reports_dir = Path("reports")
    reports_dir.mkdir(parents=True, exist_ok=True)
    file_path = reports_dir / f"spectre_report_{scan_id}.pdf"

    c = canvas.Canvas(str(file_path), pagesize=A4)
    width, height = A4
    y = height - 20 * mm

    def line(text: str, step: float = 7.5):
        nonlocal y
        c.drawString(15 * mm, y, text[:120])
        y -= step * mm
        if y < 20 * mm:
            c.showPage()
            y = height - 20 * mm

    c.setFont("Helvetica-Bold", 16)
    line("SPECTRE - AI Penetration Testing Report", step=9)
    c.setFont("Helvetica", 11)
    line(f"Scan ID: {scan_id}", step=6)
    line(f"Target: {target}", step=6)
    line("", step=3)

    c.setFont("Helvetica-Bold", 13)
    line("Vulnerability Findings", step=7)
    c.setFont("Helvetica", 10)
    for vuln in results.get("vulns", []):
        line(f"- {vuln.get('id')} | {vuln.get('severity')} | CVSS {vuln.get('cvss')}", step=5)
        line(f"  {vuln.get('name')}", step=5)

    line("", step=3)
    c.setFont("Helvetica-Bold", 13)
    line("AI Narrative", step=7)
    c.setFont("Helvetica", 10)
    for paragraph in str(results.get("ai_narrative", "")).splitlines():
        paragraph = paragraph.strip()
        if paragraph:
            line(paragraph, step=5)

    c.save()
    return str(file_path)
