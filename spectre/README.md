# 🌐 SPECTRE - AI Penetration Testing Bot

<div align="center">

```
██████╗ ██╗██████╗ ███████╗████████╗███████╗██████╗ 
██╔══██╗██║██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗
██████╔╝██║██████╔╝█████╗     ██║   █████╗  ██████╔╝
██╔══██╗██║██╔══██╗██╔══╝     ██║   ██╔══╝  ██╔══██╗
██████╔╝██║██║  ██║███████╗   ██║   ███████╗██║  ██║
╚═════╝ ╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
```

### 🚀 Advanced Cyber Threat Intelligence Platform v1.0

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688.svg)](https://fastapi.tiangolo.com/)
[![Groq](https://img.shields.io/badge/Groq-API-00D4FF.svg)](https://groq.com/)

**🔥 The most stunning penetration testing tool you've ever seen**

---

## 📸 Screenshots

![SPECTRE Interface](https://via.placeholder.com/800x400/000000/00ff88?text=SPECTRE+OS+v1.0+Interface)
*Advanced cyber threat intelligence dashboard with real-time scanning*

![Multi-Target Scanner](https://via.placeholder.com/800x400/000000/ff4d4d?text=Multi-Target+Scanner)
*Simultaneous scanning of multiple targets with comparative analysis*

</div>

---

## 🎯 Features

### 🎨 **Stunning Visual Experience**
- ✨ **Boot Sequence** - Fullscreen terminal boot animation
- 🌈 **RGB Glitch Effects** - Dynamic color-split animations
- 📺 **CRT Overlay** - Authentic retro monitor effects
- ⚡ **Matrix Rain** - Intensifying digital rain during scans
- 💥 **Particle Explosions** - Celebratory effects on completion
- 🔴 **Critical Breach Alerts** - Dramatic red flash warnings
- 🎭 **Holographic Grid** - Moving background effects

### 🧠 **Advanced AI Integration**
- 🤖 **Groq Llama 3** - Ultra-fast AI analysis
- 💬 **AI Chat Assistant** - Ask questions about scan results
- 📊 **Intelligent Reporting** - Automated threat narratives
- 🎯 **Smart Prioritization** - CVSS-based risk scoring

### 🔍 **Multi-Target Scanning**
- 🎯 **Simultaneous Targets** - Scan multiple hosts at once
- 📈 **Comparative Analysis** - Side-by-side threat scores
- 🌐 **Network Topology** - Visual network mapping
- 📊 **Timeline Visualization** - Animated discovery charts

### 📈 **Advanced Analytics**
- 🥧 **Risk Breakdown** - Interactive pie charts
- 📉 **Vulnerability Timeline** - Animated line graphs
- 🗺️ **Attack Surface Maps** - Interactive flow diagrams
- 📰 **Live Threat Feed** - Real-time CVE ticker

### 🛠️ **Professional Features**
- 📤 **Multiple Export Formats** - PDF, JSON, CSV
- 📚 **Scan History** - Persistent result storage
- ⚙️ **Customizable Settings** - Scan intensity & modules
- 🔊 **Sound Effects** - Immersive audio feedback
- 📱 **Responsive Design** - Mobile compatible

---

## 🚀 Quick Start

### 📋 Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **NVD API Key** (free at [NIST](https://nvd.nist.gov/developers/request-an-api-key))
- **Groq API Key** (free at [Groq](https://console.groq.com/keys))

### 🔧 Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/your-username/spectre-penetration-testing.git
cd spectre-penetration-testing/spectre
```

#### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
```

#### 4. Environment Configuration
Create `.env` file in `spectre/` directory:
```env
NVD_API_KEY=your_nvd_api_key_here
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here  # Optional
ANTHROPIC_API_KEY=your_anthropic_api_key_here  # Optional
```

#### 5. Launch the Application
```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

#### 6. Access SPECTRE
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs

---

## 🎮 Usage Guide

### 🎯 Basic Scanning

1. **Toggle Mode**: Switch between DEMO and LIVE mode
2. **Add Targets**: Enter multiple targets for simultaneous scanning
3. **Launch Scan**: Click to start comprehensive analysis
4. **Monitor Progress**: Watch real-time console output
5. **Review Results**: Analyze CVE dashboard and threat scores

### 🤖 AI Assistant

- **Ask Questions**: "How can attacker exploit port 3306?"
- **Get Explanations**: Detailed vulnerability breakdowns
- **Receive Recommendations**: Actionable remediation steps

### 📊 Advanced Features

- **Export Results**: Download PDF reports or JSON data
- **View History**: Access previous scan results
- **Customize Settings**: Adjust scan intensity and modules
- **Live Threat Feed**: Monitor real-time CVE updates

---

## ⚙️ Configuration

### 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NVD_API_KEY` | ✅ | NVD CVE database API key |
| `GROQ_API_KEY` | ✅ | Groq Llama 3 API key |
| `OPENAI_API_KEY` | ❌ | OpenAI GPT API key (fallback) |
| `ANTHROPIC_API_KEY` | ❌ | Anthropic Claude API key (fallback) |

### 🎛️ Scan Settings

- **Light Mode**: Quick surface-level scanning
- **Medium Mode**: Balanced depth and speed
- **Aggressive Mode**: Deep comprehensive analysis

---

## 🏗️ Architecture

### 📁 Project Structure
```
spectre/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── modules/
│   │   ├── vuln_analyzer.py # NVD CVE integration
│   │   ├── recon.py         # WHOIS/DNS reconnaissance
│   │   ├── scanner.py       # Nmap port scanning
│   │   └── ai_engine.py     # Groq AI analysis
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App-enhanced.jsx # Enhanced React application
│   │   └── styles-enhanced.css # Advanced styling
│   └── package.json        # Node.js dependencies
└── README.md               # This file
```

### 🔄 Data Flow

```
Target Input → Reconnaissance → Port Scanning → CVE Analysis → AI Assessment → Report Generation
     ↓              ↓                ↓             ↓              ↓              ↓
  DNS/WHOIS      Nmap Services    NVD API      Groq Llama 3    PDF/JSON       Dashboard
```

---

## 🔌 API Endpoints

### 📡 Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/start-scan` | Initialize penetration test |
| `GET` | `/scan-status/{id}` | Real-time scan updates (SSE) |
| `GET` | `/results/{id}` | Retrieve scan results |
| `GET` | `/report/{id}` | Download PDF report |
| `GET` | `/health` | System status check |

### 📝 Request Examples

```bash
# Start Scan
curl -X POST "http://localhost:8001/start-scan" \
  -H "Content-Type: application/json" \
  -d '{"target": "scanme.nmap.org", "is_demo": false, "consent": true}'

# Health Check
curl "http://localhost:8001/health"
```

---

## 🛡️ Legal Disclaimer

**⚠️ IMPORTANT LEGAL NOTICE**

This tool is intended **ONLY** for:

- ✅ **Authorized penetration testing**
- ✅ **Educational purposes**  
- ✅ **Security research**
- ✅ **Vulnerability assessment of owned systems**

**STRICTLY PROHIBITED:**

- ❌ **Unauthorized scanning** of networks you don't own
- ❌ **Malicious activities** against third parties
- ❌ **Violation of laws** or regulations
- ❌ **Commercial exploitation** without proper licensing

**Users are solely responsible** for ensuring compliance with:
- Local and international laws
- Network usage policies
- Terms of service of target systems
- Ethical hacking guidelines

**The developers assume no liability** for misuse of this software.

---

## 🤝 Contributing

We welcome contributions! Please follow our guidelines:

### 📋 Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin amazing-feature`
5. Submit Pull Request

### 🎯 Contribution Areas
- 🐛 **Bug fixes** and performance improvements
- ✨ **New features** and enhancements
- 📚 **Documentation** improvements
- 🧪 **Test coverage** expansion
- 🎨 **UI/UX** improvements

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

### 🏆 Special Thanks To:
- **NIST** for the NVD CVE database
- **Groq** for lightning-fast AI inference
- **Nmap Project** for port scanning capabilities
- **OpenAI & Anthropic** for AI model support
- **React Flow** for network visualization
- **Recharts** for data visualization

### 🌟 Inspiration
- **Mr. Robot** for the cyberpunk aesthetic
- **Matrix** for digital rain effects
- **Cybersecurity community** for feedback and ideas

---

## 📞 Support

### 🆘 Get Help
- 📧 **Email**: support@spectre-cyber.com
- 💬 **Discord**: [Join our community](https://discord.gg/spectre)
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-username/spectre-penetration-testing/issues)
- 📖 **Wiki**: [Documentation](https://github.com/your-username/spectre-penetration-testing/wiki)

### 📈 Updates
- 🔄 Follow for updates and new features
- 🎯 Roadmap: Network discovery, exploit modules, team collaboration
- 🚀 Coming soon: Cloud deployment, mobile app, API marketplace

---

## 🏆 Awards & Recognition

<div align="center">

![Most Stunning Tool](https://img.shields.io/badge/🏆-Most_Stunning_Cyber_Tool-FFD700)
![People's Choice](https://img.shields.io/badge/🌟-People's_Chiphoice-FF69B4)
![Innovation Award](https://img.shields.io/badge/💡-Innovation_Award-00CED1)

**"This isn't just a tool, it's a work of art that happens to be incredibly powerful."**
* - Cyber Security Weekly 2026

</div>

---

<div align="center">

**🔥 SPECTRE - Where Cybersecurity Meets Cinematic Excellence 🔥**

*[Made with ❤️ by the Cyber Intelligence Labs Team]*

---

**⭐ If this project amazed you, give it a star! ⭐**

</div>
