import asyncio
import os

try:
    from openai import AsyncOpenAI
except Exception:  # pragma: no cover
    AsyncOpenAI = None

try:
    from anthropic import AsyncAnthropic
except Exception:  # pragma: no cover
    AsyncAnthropic = None

try:
    from groq import AsyncGroq
except Exception:  # pragma: no cover
    AsyncGroq = None

FALLBACK_NARRATIVE = """
## Executive Threat Summary
SPECTRE classifies the host as **Critical Risk**. Multiple exposed services run vulnerable software versions with publicly documented exploit paths and high CVSS scores.

## Attack Narrative
An adversary begins with passive recon and discovers internet-facing SSH, Apache, MySQL, and Redis services. Exploit kits then target known flaws such as Apache path traversal and Redis sandbox escape to obtain host-level execution. From there, credential theft and data exfiltration become likely, with lateral movement potential across connected infrastructure.

## Strategic Remediation
1. Immediately restrict exposure of MySQL and Redis to private networks only.
2. Patch Apache/OpenSSH/Redis/MySQL to supported versions and validate with rescans.
3. Enforce MFA for administrative access and rotate all privileged credentials.
4. Deploy WAF and host EDR telemetry for rapid anomaly detection.
5. Establish weekly vulnerability management with SLA-based remediation tracking.
""".strip()


async def _generate_groq(prompt: str) -> str:
    if AsyncGroq is None:
        raise RuntimeError("groq package is not installed")
    client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
    response = await client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.35,
        max_tokens=1000
    )
    return response.choices[0].message.content or FALLBACK_NARRATIVE


async def _generate_openai(prompt: str) -> str:
    if AsyncOpenAI is None:
        raise RuntimeError("openai package is not installed")
    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = await client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        messages=[{"role": "user", "content": prompt}],
        temperature=0.35,
    )
    return response.choices[0].message.content or FALLBACK_NARRATIVE


async def _generate_claude(prompt: str) -> str:
    if AsyncAnthropic is None:
        raise RuntimeError("anthropic package is not installed")
    client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    response = await client.messages.create(
        model=os.getenv("ANTHROPIC_MODEL", "claude-3-5-haiku-latest"),
        max_tokens=800,
        temperature=0.35,
        messages=[{"role": "user", "content": prompt}],
    )
    blocks = [block.text for block in response.content if hasattr(block, "text")]
    return "\n".join(blocks).strip() or FALLBACK_NARRATIVE


async def generate_narrative(vuln_data: list, is_demo: bool, queue: asyncio.Queue) -> str:
    await queue.put({"phase": "report", "status": "running", "message": "SPECTRE AI is modeling threat paths..."})
    await asyncio.sleep(0.5)

    # Enhanced prompt with more context
    vuln_summary = []
    for vuln in vuln_data:
        vuln_summary.append(f"CVE: {vuln.get('id', 'Unknown')}, Severity: {vuln.get('severity', 'Unknown')}, CVSS: {vuln.get('cvss', 0)}, Service: {vuln.get('affected_service', 'Unknown')}")
    
    prompt = (
        "You are an elite penetration tester and security analyst writing a comprehensive threat assessment report.\n"
        f"Vulnerability findings:\n" + "\n".join(vuln_summary) + "\n\n"
        "Analyze these findings and provide:\n"
        "1. Executive Threat Summary - Overall risk assessment and critical findings\n"
        "2. Attack Narrative - How an attacker could exploit these vulnerabilities step by step\n"
        "3. Strategic Remediation - Prioritized action plan to mitigate the risks\n\n"
        "Use professional cybersecurity terminology. Be specific about potential attack paths and business impact."
        "Format the response in clean markdown with the three sections clearly marked."
    )

    # Demo mode must remain fully offline
    if is_demo:
        await queue.put({"phase": "report", "status": "running", "message": "Offline narrative model selected (demo mode)."})
        await asyncio.sleep(0.6)
        return FALLBACK_NARRATIVE

    # Check for API keys and try different providers - Groq first
    groq_key = os.getenv("GROQ_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    
    if not groq_key and not openai_key and not anthropic_key:
        await queue.put({"phase": "report", "status": "running", "message": "No AI API keys found. Using offline analysis."})
        return FALLBACK_NARRATIVE

    try:
        # Try Groq first if key is available
        if groq_key and AsyncGroq:
            await queue.put({"phase": "report", "status": "running", "message": "Using Groq Llama 3 for threat analysis..."})
            return await _generate_groq(prompt)
        elif groq_key:
            await queue.put({"phase": "report", "status": "running", "message": "Groq package not installed. Trying OpenAI..."})
    except Exception as exc:
        await queue.put({"phase": "report", "status": "running", "message": f"Groq API error: {str(exc)[:100]}. Trying OpenAI..."})

    try:
        # Try OpenAI if Groq failed or key not available
        if openai_key and AsyncOpenAI:
            await queue.put({"phase": "report", "status": "running", "message": "Using OpenAI GPT for threat analysis..."})
            return await _generate_openai(prompt)
        elif openai_key:
            await queue.put({"phase": "report", "status": "running", "message": "OpenAI package not installed. Trying Claude..."})
    except Exception as exc:
        await queue.put({"phase": "report", "status": "running", "message": f"OpenAI API error: {str(exc)[:100]}. Trying Claude..."})

    try:
        # Try Claude if both failed or key not available
        if anthropic_key and AsyncAnthropic:
            await queue.put({"phase": "report", "status": "running", "message": "Using Claude for threat analysis..."})
            return await _generate_claude(prompt)
        elif anthropic_key:
            await queue.put({"phase": "report", "status": "running", "message": "Anthropic package not installed."})
    except Exception as exc:
        await queue.put({"phase": "report", "status": "running", "message": f"Claude API error: {str(exc)[:100]}. Falling back."})

    # If all failed, return fallback
    await queue.put({"phase": "report", "status": "running", "message": "AI providers unavailable. Using offline analysis."})
    return FALLBACK_NARRATIVE
