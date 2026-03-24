import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactFlow, { Background, Controls } from "reactflow";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { 
  Terminal, 
  Network, 
  Shield, 
  AlertTriangle, 
  Activity, 
  Download, 
  Copy, 
  History, 
  Settings, 
  MessageSquare, 
  Maximize2, 
  Volume2, 
  VolumeX,
  Globe,
  Lock,
  Unlock,
  Zap,
  Target,
  Radio,
  Database,
  FileText,
  Trash2,
  Plus,
  X,
  Send,
  TrendingUp,
  Clock,
  Wifi,
  Server,
  Cpu,
  HardDrive,
  Minimize2
} from "lucide-react";
import "reactflow/dist/style.css";
import "./styles-enhanced.css";
import "./styles-additional.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8001";
const PHASES = ["recon", "scan", "exploit", "report"];
const DEMO_TARGET = "demo-target.local";

const DEMO_VULNS = [
  { id: "CVE-2023-44487", severity: "CRITICAL", cvss: 9.8, name: "HTTP/2 Rapid Reset", port: "80" },
  { id: "CVE-2023-23397", severity: "HIGH", cvss: 9.1, name: "Privilege Escalation", port: "22" },
  { id: "CVE-2022-42889", severity: "HIGH", cvss: 9.8, name: "Apache RCE", port: "443" },
  { id: "CVE-2021-44228", severity: "HIGH", cvss: 10.0, name: "Log4Shell", port: "8080" },
  { id: "CVE-2022-26134", severity: "MEDIUM", cvss: 7.5, name: "Confluence RCE", port: "3306" },
];

const BOOT_SEQUENCE = [
  "SPECTRE OS v1.0 BOOTING...",
  "LOADING NEURAL NETWORK MODULES...",
  "BYPASSING FIREWALL PROTOCOLS...",
  "ESTABLISHING ENCRYPTED CONNECTION...",
  "SYSTEM READY."
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

const COLORS = {
  critical: "#ff4d4d",
  high: "#ff9e4d", 
  medium: "#ffff00",
  low: "#00d4ff"
};

function riskLabel(score) {
  if (score >= 85) return "Critical";
  if (score >= 65) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

export default function App() {
  const [targets, setTargets] = useState([DEMO_TARGET]);
  const [scanId, setScanId] = useState("");
  const [phase, setPhase] = useState("recon");
  const [logs, setLogs] = useState(["[00:00] Awaiting launch command..."]);
  const [typedLogs, setTypedLogs] = useState([]);
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [showBoot, setShowBoot] = useState(true);
  const [bootLines, setBootLines] = useState([]);
  const [glitchBurst, setGlitchBurst] = useState(false);
  const [matrixBoost, setMatrixBoost] = useState(false);
  const [threatBurst, setThreatBurst] = useState(false);
  const [shake, setShake] = useState(false);
  const [redFlash, setRedFlash] = useState(false);
  const [breachBanner, setBreachBanner] = useState(false);
  const [animatedThreat, setAnimatedThreat] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(-1);
  const [scoreImpact, setScoreImpact] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [scanHistory, setScanHistory] = useState([]);
  const [scanIntensity, setScanIntensity] = useState("medium");
  const [liveThreats, setLiveThreats] = useState([]);
  const [networkTopology, setNetworkTopology] = useState([]);
  
  const consoleRef = useRef(null);
  const matrixRef = useRef(null);
  const audioCtxRef = useRef(null);
  const chatEndRef = useRef(null);

  // Boot sequence
  useEffect(() => {
    BOOT_SEQUENCE.forEach((line, idx) => {
      setTimeout(() => setBootLines((prev) => [...prev, line]), idx * 700);
    });
    const hideId = setTimeout(() => setShowBoot(false), 3500);
    return () => clearTimeout(hideId);
  }, []);

  // Glitch effect
  useEffect(() => {
    const id = setInterval(() => {
      setGlitchBurst(true);
      setTimeout(() => setGlitchBurst(false), 360);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Matrix rain
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

  // Typing effect
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

  // Console scroll
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [typedLogs]);

  // Chat scroll
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Animated threat score
  useEffect(() => {
    const targetScore = results?.threat_score || 0;
    let current = 0;
    const id = setInterval(() => {
      current += 1;
      setAnimatedThreat(Math.min(current, targetScore));
      if (current >= targetScore) {
        clearInterval(id);
        setScoreImpact(true);
        setTimeout(() => setScoreImpact(false), 400);
      }
    }, 18);
    return () => clearInterval(id);
  }, [results]);

  // Live threats feed
  useEffect(() => {
    if (!isLiveMode) return;
    
    const interval = setInterval(() => {
      const threats = [
        "CVE-2024-1234: Critical RCE in Apache 2.4.57",
        "CVE-2024-5678: SQL Injection in WordPress 6.4", 
        "CVE-2024-9012: Buffer Overflow in OpenSSL 3.0",
        "CVE-2024-3456: XSS in Chrome 120.0",
      ];
      setLiveThreats(prev => [
        ...prev.slice(-4),
        { id: Date.now(), text: threats[Math.floor(Math.random() * threats.length)] }
      ]);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isLiveMode]);

  const playTypeClick = useCallback(() => {
    if (!soundEnabled) return;
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
      // Ignore audio errors
    }
  }, [soundEnabled]);

  const startScan = async () => {
    if (busy) return;
    setBusy(true);
    setLogs(["[00:00] Booting autonomous attack simulation..."]);
    setTypedLogs([""]);
    setResults(null);
    setPhase("recon");
    setAnimatedThreat(0);
    setPhaseIndex(0);
    setMatrixBoost(true);

    try {
      const target = targets[0];
      const res = await fetch(`${API_BASE}/start-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, is_demo: !isLiveMode, consent: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setScanId(data.scan_id || "");
        
        if (isLiveMode && data.scan_id) {
          connectToLiveStream(data.scan_id);
        }
      }
    } catch {
      setScanId("");
    }

    if (!isLiveMode) {
      TIMELINE.forEach((entry) => {
        setTimeout(() => {
          const stamp = `[00:${String(entry.at).padStart(2, "0")}]`;
          setLogs((prev) => [...prev, `${stamp} ${entry.text}`]);
          setTypedLogs((prev) => [...prev, ""]);
          setPhase(entry.phase);
          setPhaseIndex(PHASES.indexOf(entry.phase));
          if (entry.text.includes("CRITICAL")) {
            setShake(true);
            setRedFlash(true);
            setBreachBanner(true);
            setTimeout(() => setShake(false), 650);
            setTimeout(() => setRedFlash(false), 380);
            setTimeout(() => setBreachBanner(false), 1500);
          }
        }, entry.at * 1000);
      });

      setTimeout(() => {
        setResults({
          target: DEMO_TARGET,
          threat_score: 87,
          vulns: DEMO_VULNS,
          ai_narrative: "SPECTRE AI ASSESSMENT: Target demo-target.local presents critical attack surface. 5 vulnerabilities identified with combined risk score 87/100. Immediate patching required for CVE-2021-44228 (Log4Shell) and CVE-2023-44487. Estimated time to compromise by skilled attacker: 4-6 hours.",
        });
        setBusy(false);
        setPhase("report");
        setPhaseIndex(3);
        setThreatBurst(true);
        setTimeout(() => setMatrixBoost(false), 2000);
        setTimeout(() => setThreatBurst(false), 1300);
        
        // Add to history
        setScanHistory(prev => [{
          id: Date.now(),
          target: DEMO_TARGET,
          timestamp: new Date().toISOString(),
          threat_score: 87,
          vuln_count: DEMO_VULNS.length
        }, ...prev]);
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
        setThreatBurst(true);
        setTimeout(() => setMatrixBoost(false), 2000);
        setTimeout(() => setThreatBurst(false), 1300);
        eventSource.close();
        
        // Add to history
        setScanHistory(prev => [{
          id: Date.now(),
          target: data.results.target,
          timestamp: new Date().toISOString(),
          threat_score: data.results.threat_score,
          vuln_count: data.results.vulns?.length || 0
        }, ...prev]);
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

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { type: "user", text: userMessage }]);
    
    // Simulate AI response (in real app, this would call Groq API)
    setTimeout(() => {
      const responses = [
        "Based on the scan results, port 3306 (MySQL) could be exploited through SQL injection if proper authentication isn't implemented.",
        "The critical CVE on port 80 allows remote code execution. An attacker could gain complete system control.",
        "Port 22 (SSH) shows a high-severity vulnerability. Consider implementing key-based authentication and disabling password auth.",
        "The Apache server on port 443 has multiple vulnerabilities. Immediate patching is recommended.",
      ];
      setChatMessages(prev => [...prev, { 
        type: "assistant", 
        text: responses[Math.floor(Math.random() * responses.length)] 
      }]);
    }, 1000);
  };

  const exportResults = (format) => {
    if (!results) return;
    
    switch(format) {
      case "json":
        const dataStr = JSON.stringify(results, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `spectre_scan_${results.target}_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        break;
      case "csv":
        // CSV export logic
        break;
      case "pdf":
        // PDF export logic
        break;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const addTarget = () => {
    setTargets(prev => [...prev, ""]);
  };

  const updateTarget = (index, value) => {
    setTargets(prev => {
      const newTargets = [...prev];
      newTargets[index] = value;
      return newTargets;
    });
  };

  const removeTarget = (index) => {
    setTargets(prev => prev.filter((_, i) => i !== index));
  };

  const riskData = useMemo(() => {
    if (!results?.vulns) return [];
    
    const counts = {
      critical: 0,
      high: 0, 
      medium: 0,
      low: 0
    };
    
    results.vulns.forEach(vuln => {
      const severity = vuln.severity.toLowerCase();
      if (counts[severity] !== undefined) {
        counts[severity]++;
      }
    });
    
    return Object.entries(counts).map(([name, value]) => ({
      name: name.toUpperCase(),
      value,
      color: COLORS[name]
    }));
  }, [results]);

  const timelineData = useMemo(() => {
    if (!results?.vulns) return [];
    
    return results.vulns.map((vuln, index) => ({
      time: index * 2,
      cvss: vuln.cvss,
      name: vuln.id
    }));
  }, [results]);

  const flow = useMemo(() => {
    const nodes = [
      { id: "attacker", position: { x: 20, y: 120 }, data: { label: "ATTACKER" }, style: { color: "#00ff88", background: "#07130f", border: "1px solid #00ff88", width: 130 } },
      { id: "recon", position: { x: 200, y: 120 }, data: { label: "Recon" }, style: { color: "#00d4ff", background: "#021016", border: "1px solid #00d4ff", width: 120 } },
      { id: "scan", position: { x: 370, y: 120 }, data: { label: "Port Scan" }, style: { color: "#00d4ff", background: "#021016", border: "1px solid #00d4ff", width: 130 } },
      { id: "exploit", position: { x: 560, y: 120 }, data: { label: "Exploit" }, style: { color: "#ff9e4d", background: "#1a1007", border: "1px solid #ff9e4d", width: 120 } },
      { id: "target", position: { x: 730, y: 120 }, data: { label: "TARGET" }, style: { color: "#ff4d4d", background: "#18090a", border: "1px solid #ff4d4d", width: 120 } },
    ];
    
    // Add port nodes if results exist
    if (results?.scan) {
      Object.entries(results.scan).forEach(([port, service], index) => {
        nodes.push({
          id: `port-${port}`,
          position: { x: 400 + (index % 3) * 100, y: 250 + Math.floor(index / 3) * 80 },
          data: { label: `${port}/tcp` },
          style: { 
            color: service.state === "open" ? "#ff4d4d" : "#666", 
            background: service.state === "open" ? "#18090a" : "#111", 
            border: `1px solid ${service.state === "open" ? "#ff4d4d" : "#666"}`, 
            width: 80 
          }
        });
      });
    }
    
    const edges = [
      { id: "e1", source: "attacker", target: "recon", animated: busy || !!results, style: { stroke: "#00d4ff" } },
      { id: "e2", source: "recon", target: "scan", animated: busy || !!results, style: { stroke: "#00d4ff" } },
      { id: "e3", source: "scan", target: "exploit", animated: busy || !!results, style: { stroke: "#ff9e4d" } },
      { id: "e4", source: "exploit", target: "target", animated: busy || !!results, style: { stroke: "#ff4d4d" } },
    ];
    
    return { nodes, edges };
  }, [busy, results]);

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

  return (
    <div className={`app ${shake ? "camera-shake" : ""}`}>
      {/* Boot Sequence */}
      <AnimatePresence>
        {showBoot && (
          <motion.div 
            className="boot-sequence"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {bootLines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Effects */}
      <div className="crt-overlay" />
      <div className="holo-grid" />
      <canvas ref={matrixRef} className="matrix-bg" />
      <div className={`red-alert-flash ${redFlash ? "active" : ""}`} />
      {breachBanner && <div className="breach-banner">⚠ CRITICAL BREACH DETECTED</div>}
      
      {/* Particles */}
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

      {/* Header */}
      <header className="hero">
        <h1 className={`glitch ${glitchBurst ? "burst" : ""}`} data-text="SPECTRE">SPECTRE</h1>
        <p className="tagline">AUTONOMOUS AI PENETRATION TESTING</p>
        <p>Advanced Cyber Threat Intelligence Platform v1.0</p>
      </header>

      {/* Control Bar */}
      <div className="control-bar">
        <button onClick={() => setShowSettings(!showSettings)} className="icon-btn">
          <Settings size={20} />
        </button>
        <button onClick={() => setShowHistory(!showHistory)} className="icon-btn">
          <History size={20} />
        </button>
        <button onClick={() => setShowChat(!showChat)} className="icon-btn">
          <MessageSquare size={20} />
        </button>
        <button onClick={toggleFullscreen} className="icon-btn">
          {fullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
        <button onClick={() => setSoundEnabled(!soundEnabled)} className="icon-btn">
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      {/* Multi-Target Scanner */}
      <section className="panel">
        <h2>Multi-Target Scanner</h2>
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
        
        <div className="targets-container">
          {targets.map((target, index) => (
            <div key={index} className="target-input-group">
              <input 
                value={target} 
                onChange={(e) => updateTarget(index, e.target.value)}
                placeholder={isLiveMode ? "Enter target (e.g., scanme.nmap.org)" : "demo-target.local"}
                disabled={busy || !isLiveMode}
                className="target-input"
              />
              {targets.length > 1 && (
                <button 
                  onClick={() => removeTarget(index)}
                  className="remove-target-btn"
                  disabled={busy}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          <button 
            onClick={addTarget}
            className="add-target-btn"
            disabled={busy}
          >
            <Plus size={16} /> Add Target
          </button>
        </div>
        
        <button 
          className={`launch-btn ${!busy ? "pulse" : ""} ${isLiveMode ? "live-mode" : "demo-mode"}`} 
          onClick={startScan} 
          disabled={busy || targets.some(t => !t.trim())}
        >
          {isLiveMode ? "LAUNCH LIVE SCAN" : "LAUNCH DEMO ATTACK CHAIN"}
        </button>
      </section>

      {/* Phase Tracker */}
      <section className="panel">
        <h2>Phase Tracker</h2>
        <div className="phases">
          {PHASES.map((p, idx) => (
            <motion.span 
              key={p} 
              className={`phase ${idx <= phaseIndex ? "active" : ""} ${phase === p ? "current" : ""}`}
              initial={{ scale: 0 }}
              animate={{ scale: idx <= phaseIndex ? 1 : 0.8 }}
              transition={{ delay: idx * 0.1 }}
            >
              {p.toUpperCase()}
            </motion.span>
          ))}
        </div>
      </section>

      {/* Live Console */}
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

      {/* Results Dashboard */}
      {results && (
        <>
          {/* Threat Meter & Attack Map */}
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
              <h2>Attack Surface Map</h2>
              <div className="map">
                <ReactFlow nodes={flow.nodes} edges={flow.edges} fitView>
                  <Background color="#0b3e31" />
                  <Controls />
                </ReactFlow>
              </div>
            </div>
          </section>

          {/* Risk Analysis */}
          <section className="panel grid3">
            <div>
              <h2>Risk Score Breakdown</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h2>Vulnerability Timeline</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="time" stroke="#00ff88" />
                  <YAxis stroke="#00ff88" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#000", border: "1px solid #00ff88" }}
                    labelStyle={{ color: "#00ff88" }}
                  />
                  <Line type="monotone" dataKey="cvss" stroke="#ff4d4d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h2>Export Options</h2>
              <div className="export-buttons">
                <button onClick={() => exportResults("json")} className="export-btn">
                  <FileText size={16} /> JSON
                </button>
                <button onClick={() => exportResults("csv")} className="export-btn">
                  <Database size={16} /> CSV
                </button>
                <button onClick={() => exportResults("pdf")} className="export-btn">
                  <Download size={16} /> PDF
                </button>
                <button className="export-btn">
                  <Copy size={16} /> Copy
                </button>
              </div>
            </div>
          </section>

          {/* CVE Dashboard */}
          <section className="panel">
            <h2>CVE Dashboard</h2>
            <table>
              <thead>
                <tr>
                  <th>CVE</th><th>Severity</th><th>CVSS</th><th>Port</th><th>Description</th>
                </tr>
              </thead>
              <tbody>
                {results.vulns.map((v) => (
                  <tr key={v.id} className={`sev-${v.severity.toLowerCase()}`}>
                    <td>{v.id}</td>
                    <td>{v.severity}</td>
                    <td>{v.cvss}</td>
                    <td>{v.port || "N/A"}</td>
                    <td>{v.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <pre className="narrative">{results.ai_narrative}</pre>
          </section>
        </>
      )}

      {/* Live Threat Feed */}
      {isLiveMode && (
        <section className="threat-feed">
          <div className="threat-ticker">
            <TrendingUp size={16} />
            <div className="threat-scroll">
              {liveThreats.map((threat) => (
                <span key={threat.id} className="threat-item">
                  {threat.text}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Chat Assistant */}
      {showChat && (
        <motion.div 
          className="chat-panel"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="chat-header">
            <h3>AI Assistant</h3>
            <button onClick={() => setShowChat(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="chat-messages">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.type}`}>
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
              placeholder="Ask about the scan results..."
            />
            <button onClick={sendChatMessage}>
              <Send size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <motion.div 
          className="settings-panel"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="settings-header">
            <h3>Settings</h3>
            <button onClick={() => setShowSettings(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="settings-content">
            <div className="setting-group">
              <label>Scan Intensity</label>
              <select value={scanIntensity} onChange={(e) => setScanIntensity(e.target.value)}>
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
            <div className="setting-group">
              <label>Sound Effects</label>
              <button onClick={() => setSoundEnabled(!soundEnabled)}>
                {soundEnabled ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Scan History */}
      {showHistory && (
        <motion.div 
          className="history-panel"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="history-header">
            <h3>Scan History</h3>
            <button onClick={() => setShowHistory(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="history-content">
            {scanHistory.map((scan) => (
              <div key={scan.id} className="history-item">
                <div className="history-target">{scan.target}</div>
                <div className="history-details">
                  <span className="history-score">Score: {scan.threat_score}</span>
                  <span className="history-vulns">{scan.vuln_count} vulns</span>
                  <span className="history-time">{new Date(scan.timestamp).toLocaleString()}</span>
                </div>
                <button className="history-load">Load</button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <span>SPECTRE v1.0</span>
          <span>|</span>
          <span>FOR AUTHORIZED TESTING ONLY</span>
          <span>|</span>
          <span>© 2026 Cyber Intelligence Labs</span>
        </div>
      </footer>

      {/* Watermark */}
      <div className="watermark">SPECTRE v1.0</div>
    </div>
  );
}
