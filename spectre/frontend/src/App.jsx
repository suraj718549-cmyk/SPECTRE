import { useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8001";
const PHASES = ["recon", "scan", "exploit", "report"];
const DEMO_TARGET = "demo-target.local";

const DEMO_VULNS = [
  { id: "CVE-2023-44487", severity: "CRITICAL", cvss: 9.8, name: "HTTP/2 Rapid Reset" },
  { id: "CVE-2023-23397", severity: "HIGH", cvss: 9.1, name: "Privilege Escalation" },
  { id: "CVE-2022-42889", severity: "HIGH", cvss: 9.8, name: "Apache RCE" },
  { id: "CVE-2021-44228", severity: "HIGH", cvss: 10.0, name: "Log4Shell" },
  { id: "CVE-2022-26134", severity: "MEDIUM", cvss: 7.5, name: "Confluence RCE" },
];

const TIMELINE = [
  { at: 1, phase: "recon", text: "Initializing SPECTRE engine..." },
  { at: 2, phase: "recon", text: "Target acquired: demo-target.local" },
  { at: 3, phase: "recon", text: "Starting reconnaissance phase..." },
  { at: 4, phase: "recon", text: "Whois lookup complete - Registrar: GoDaddy" },
  { at: 5, phase: "recon", text: "DNS enumeration found 7 subdomains" },
  { at: 6, phase: "scan", text: "Port scan initiated on 65535 ports..." },
  { at: 8, phase: "scan", text: "Open ports found: 22(SSH), 80(HTTP), 443(HTTPS), 3306(MySQL), 8080" },
  { at: 10, phase: "scan", text: "Service fingerprinting complete" },
  { at: 12, phase: "exploit", text: "CVE database lookup initiated..." },
  { at: 14, phase: "exploit", text: "CRITICAL: CVE-2023-44487 found - HTTP/2 Rapid Reset Attack" },
  { at: 15, phase: "exploit", text: "HIGH: CVE-2023-23397 found - Privilege Escalation" },
  { at: 16, phase: "exploit", text: "HIGH: CVE-2022-42889 found - Apache Text4Shell RCE" },
  { at: 18, phase: "report", text: "Generating AI threat analysis..." },
  { at: 20, phase: "report", text: "SPECTRE analysis complete. Threat Score: 87/100" },
];

function riskLabel(score) {
  if (score >= 85) return "Critical";
  if (score >= 65) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

export default function App() {
  const [target, setTarget] = useState(DEMO_TARGET);
  const [scanId, setScanId] = useState("");
  const [phase, setPhase] = useState("recon");
  const [logs, setLogs] = useState(["[00:00] Awaiting launch command..."]);
  const [typedLogs, setTypedLogs] = useState([]);
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const consoleRef = useRef(null);
  const matrixRef = useRef(null);
  const [animatedThreat, setAnimatedThreat] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(-1);
  const [shake, setShake] = useState(false);
  const [redFlash, setRedFlash] = useState(false);
  const [breachBanner, setBreachBanner] = useState(false);
  const [showBoot, setShowBoot] = useState(true);
  const [bootLines, setBootLines] = useState([]);
  const [glitchBurst, setGlitchBurst] = useState(false);
  const [matrixBoost, setMatrixBoost] = useState(false);
  const [threatBurst, setThreatBurst] = useState(false);
  const [scoreImpact, setScoreImpact] = useState(false);
  const audioCtxRef = useRef(null);

  const playTypeClick = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(170 + Math.random() * 35, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.025, ctx.currentTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Ignore audio errors to keep demo resilient.
    }
  };

  useEffect(() => {
    if (!logs.length) return;
    const text = logs[logs.length - 1];
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTypedLogs((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = text.slice(0, i);
        return copy;
      });
      if (i % 2 === 0) playTypeClick();
      if (i >= text.length) clearInterval(id);
    }, 14);
    return () => clearInterval(id);
  }, [logs]);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [typedLogs]);

  useEffect(() => {
    const lines = [
      "SPECTRE OS v1.0 LOADING...",
      "INITIALIZING NEURAL NETWORK...",
      "BYPASSING FIREWALL PROTOCOLS...",
      "ESTABLISHING SECURE CONNECTION...",
    ];
    lines.forEach((line, idx) => {
      window.setTimeout(() => setBootLines((prev) => [...prev, line]), idx * 700);
    });
    const hideId = window.setTimeout(() => setShowBoot(false), 3000);
    return () => window.clearTimeout(hideId);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setGlitchBurst(true);
      window.setTimeout(() => setGlitchBurst(false), 360);
    }, 3200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = matrixRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const chars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@&*";
    let raf = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const cols = () => Math.floor(canvas.width / 18);
    let drops = Array(cols()).fill(0);

    const draw = () => {
      ctx.fillStyle = matrixBoost ? "rgba(0, 0, 0, 0.04)" : "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff88";
      ctx.font = "15px Share Tech Mono";
      const speed = matrixBoost ? 2 : 1;
      for (let i = 0; i < drops.length; i += 1) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 18, drops[i] * 18);
        if (drops[i] * 18 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += speed;
      }
      if (drops.length !== cols()) drops = Array(cols()).fill(0);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [matrixBoost]);

  useEffect(() => {
    const targetScore = results?.threat_score || 0;
    let current = 0;
    const id = setInterval(() => {
      current += 1;
      setAnimatedThreat(Math.min(current, targetScore));
      if (current >= targetScore) {
        clearInterval(id);
        setScoreImpact(true);
        window.setTimeout(() => setScoreImpact(false), 400);
      }
    }, 18);
    return () => clearInterval(id);
  }, [results]);

  const startScan = async () => {
    if (busy) return;
    setBusy(true);
    setLogs(["[00:00] Booting autonomous attack simulation..."]);
    setTypedLogs([""]);
    setResults(null);
    setPhase("recon");
    setAnimatedThreat(0);
    setPhaseIndex(0);

    try {
      const res = await fetch(`${API_BASE}/start-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, is_demo: !isLiveMode, consent: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setScanId(data.scan_id || "");
        
        // Connect to SSE for real-time updates
        if (isLiveMode && data.scan_id) {
          connectToLiveStream(data.scan_id);
        }
      }
    } catch {
      setScanId("");
    }

    if (!isLiveMode) {
      // Demo mode - use simulated timeline
      TIMELINE.forEach((entry) => {
        window.setTimeout(() => {
          const stamp = `[00:${String(entry.at).padStart(2, "0")}]`;
          setLogs((prev) => [...prev, `${stamp} ${entry.text}`]);
          setTypedLogs((prev) => [...prev, ""]);
          setPhase(entry.phase);
          setPhaseIndex(PHASES.indexOf(entry.phase));
          if (entry.text.includes("CRITICAL")) {
            setShake(true);
            setRedFlash(true);
            setBreachBanner(true);
            window.setTimeout(() => setShake(false), 650);
            window.setTimeout(() => setRedFlash(false), 380);
            window.setTimeout(() => setBreachBanner(false), 1500);
          }
        }, entry.at * 1000);
      });

      window.setTimeout(() => {
        setResults({
          target: DEMO_TARGET,
          threat_score: 87,
          vulns: DEMO_VULNS,
          ai_narrative:
            "SPECTRE AI ASSESSMENT: Target demo-target.local presents critical attack surface. 5 vulnerabilities identified with combined risk score 87/100. Immediate patching required for CVE-2021-44228 (Log4Shell) and CVE-2023-44487. Estimated time to compromise by skilled attacker: 4-6 hours.",
        });
        setBusy(false);
        setPhase("report");
        setPhaseIndex(3);
        setMatrixBoost(true);
        setThreatBurst(true);
        window.setTimeout(() => setMatrixBoost(false), 2000);
        window.setTimeout(() => setThreatBurst(false), 1300);
      }, 21000);
    }
  };

  const connectToLiveStream = (scanId) => {
    const eventSource = new EventSource(`${API_BASE}/scan-status/${scanId}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const timestamp = new Date().toLocaleTimeString();
      
      setLogs((prev) => [...prev, `[${timestamp}] ${data.message}`]);
      setTypedLogs((prev) => [...prev, ""]);
      
      if (data.phase === "phase") {
        setPhase(data.step);
        setPhaseIndex(PHASES.indexOf(data.step));
      }
      
      if (data.phase === "complete") {
        setResults(data.results);
        setBusy(false);
        setPhase("report");
        setPhaseIndex(3);
        setMatrixBoost(true);
        setThreatBurst(true);
        window.setTimeout(() => setMatrixBoost(false), 2000);
        window.setTimeout(() => setThreatBurst(false), 1300);
        eventSource.close();
      }
      
      if (data.phase === "error") {
        setLogs((prev) => [...prev, `[ERROR] ${data.message}`]);
        setBusy(false);
        eventSource.close();
      }
    };
    
    eventSource.onerror = () => {
      setLogs((prev) => [...prev, "[ERROR] Connection to live stream lost"]);
      setBusy(false);
      eventSource.close();
    };
  };

  const downloadReport = () => {
    if (scanId) {
      window.open(`${API_BASE}/report/${scanId}`, "_blank", "noopener,noreferrer");
      return;
    }
    const text = [
      "SPECTRE PENETRATION TESTING REPORT",
      `Target: ${DEMO_TARGET}`,
      "Threat Score: 87/100",
      "",
      "Findings:",
      ...DEMO_VULNS.map((v) => `- ${v.id} | ${v.severity} | CVSS ${v.cvss} | ${v.name}`),
      "",
      "SPECTRE AI ASSESSMENT:",
      "Target demo-target.local presents critical attack surface. 5 vulnerabilities identified with combined risk score 87/100.",
    ].join("\n");
    const blob = new Blob([text], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SPECTRE_Demo_Report.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  const threatScore = animatedThreat;
  const ringStyle = {
    background: `conic-gradient(#00ff88 ${threatScore * 3.6}deg, #0f1d1b 0deg)`,
  };

  const particles = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 70 + 2}%`,
        delay: `${Math.random() * 4}s`,
        duration: `${4 + Math.random() * 6}s`,
      })),
    []
  );

  const flow = useMemo(() => {
    const nodes = [
      { id: "attacker", position: { x: 20, y: 120 }, data: { label: "ATTACKER" }, style: { color: "#00ff88", background: "#07130f", border: "1px solid #00ff88", width: 130 } },
      { id: "recon", position: { x: 200, y: 120 }, data: { label: "Recon" }, style: { color: "#00d4ff", background: "#021016", border: "1px solid #00d4ff", width: 120 } },
      { id: "scan", position: { x: 370, y: 120 }, data: { label: "Port Scan" }, style: { color: "#00d4ff", background: "#021016", border: "1px solid #00d4ff", width: 130 } },
      { id: "exploit", position: { x: 560, y: 120 }, data: { label: "Exploit" }, style: { color: "#ff9e4d", background: "#1a1007", border: "1px solid #ff9e4d", width: 120 } },
      { id: "target", position: { x: 730, y: 120 }, data: { label: "TARGET" }, style: { color: "#ff4d4d", background: "#18090a", border: "1px solid #ff4d4d", width: 120 } },
    ];
    const edges = [
      { id: "e1", source: "attacker", target: "recon", animated: busy || !!results, style: { stroke: "#00d4ff" } },
      { id: "e2", source: "recon", target: "scan", animated: busy || !!results, style: { stroke: "#00d4ff" } },
      { id: "e3", source: "scan", target: "exploit", animated: busy || !!results, style: { stroke: "#ff9e4d" } },
      { id: "e4", source: "exploit", target: "target", animated: busy || !!results, style: { stroke: "#ff4d4d" } },
    ];
    return { nodes, edges };
  }, [busy, results]);

  return (
    <div className={`app ${shake ? "camera-shake" : ""}`}>
      <div className="crt-overlay" />
      <div className="holo-grid" />
      <canvas ref={matrixRef} className="matrix-bg" />
      <div className={`red-alert-flash ${redFlash ? "active" : ""}`} />
      {breachBanner && <div className="breach-banner">CRITICAL BREACH DETECTED</div>}
      {showBoot && (
        <div className="boot-sequence">
          {bootLines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      )}
      <div className="particles" aria-hidden="true">
        {particles.map((p) => (
          <span
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>
      <header className="hero">
        <h1 className={`glitch ${glitchBurst ? "burst" : ""}`} data-text="SPECTRE">SPECTRE</h1>
        <p className="tagline">AUTONOMOUS AI PENETRATION TESTING</p>
        <p>AI Penetration Testing Bot</p>
      </header>

      <section className="panel">
        <h2>Target Input</h2>
        <div className="mode-toggle">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={isLiveMode}
              onChange={(e) => setIsLiveMode(e.target.checked)}
              disabled={busy}
            />
            <span className="slider"></span>
          </label>
          <span className="mode-label">{isLiveMode ? "LIVE MODE" : "DEMO MODE"}</span>
        </div>
        <input 
          value={target} 
          onChange={(e) => setTarget(e.target.value)}
          placeholder={isLiveMode ? "Enter target (e.g., scanme.nmap.org)" : "demo-target.local"}
          disabled={busy || !isLiveMode}
        />
        <button 
          className={`launch-btn ${!busy ? "pulse" : ""} ${isLiveMode ? "live-mode" : "demo-mode"}`} 
          onClick={startScan} 
          disabled={busy}
        >
          {isLiveMode ? "LAUNCH LIVE SCAN" : "LAUNCH DEMO ATTACK CHAIN"}
        </button>
      </section>

      <section className="panel">
        <h2>Phase Tracker</h2>
        <div className="phases">
          {PHASES.map((p, idx) => (
            <span key={p} className={`phase ${idx <= phaseIndex ? "active" : ""} ${phase === p ? "current" : ""}`}>{p.toUpperCase()}</span>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Live Console</h2>
        <div className="console" ref={consoleRef}>
          <div className="scanline" />
          {typedLogs.map((line, i) => (
            <div key={`${line}-${i}`}>{line}</div>
          ))}
          <span className="typing-cursor">_</span>
        </div>
      </section>

      {results && (
        <>
          <section className="panel grid2">
            <div>
              <h2>Threat Meter</h2>
              <div className={`gauge ${threatBurst ? "bursting" : ""}`} style={ringStyle}>
                <div className={`inner ${scoreImpact ? "impact" : ""}`}>
                  <strong>{threatScore}</strong>
                  <span>{riskLabel(threatScore)}</span>
                </div>
                {threatBurst && <div className="threat-particles" aria-hidden="true" />}
              </div>
            </div>
            <div>
              <h2>Attack Map</h2>
              <div className="map">
                <ReactFlow nodes={flow.nodes} edges={flow.edges} fitView>
                  <Background color="#0b3e31" />
                  <Controls />
                </ReactFlow>
              </div>
            </div>
          </section>

          <section className="panel">
            <h2>CVE Dashboard</h2>
            <table>
              <thead>
                <tr>
                  <th>CVE</th><th>Severity</th><th>CVSS</th><th>Description</th>
                </tr>
              </thead>
              <tbody>
                {results.vulns.map((v) => (
                  <tr key={v.id} className={`sev-${v.severity.toLowerCase()}`}>
                    <td>{v.id}</td>
                    <td>{v.severity}</td>
                    <td>{v.cvss}</td>
                    <td>{v.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <pre className="narrative">{results.ai_narrative}</pre>
            <button className="button launch-btn" onClick={downloadReport}>DOWNLOAD REPORT</button>
          </section>
        </>
      )}
      <footer className="footer">FOR AUTHORIZED TESTING ONLY | SPECTRE v1.0</footer>
    </div>
  );
}
