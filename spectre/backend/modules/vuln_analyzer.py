import asyncio
import os
import requests
from typing import Dict, List

def _demo_cves() -> list[dict]:
    return [
        {
            "id": "CVE-2016-6210",
            "name": "OpenSSH User Enumeration",
            "severity": "Medium",
            "cvss": 5.3,
            "description": "Timing discrepancies can expose valid usernames during SSH auth attempts.",
            "affected_service": "OpenSSH 7.2p2",
        },
        {
            "id": "CVE-2017-9798",
            "name": "Apache Optionsbleed",
            "severity": "High",
            "cvss": 7.5,
            "description": "Memory disclosure through malformed OPTIONS requests in vulnerable Apache builds.",
            "affected_service": "Apache httpd 2.4.18",
        },
        {
            "id": "CVE-2021-41773",
            "name": "Apache Path Traversal and File Disclosure",
            "severity": "Critical",
            "cvss": 9.8,
            "description": "Improper path normalization can allow traversal and source disclosure.",
            "affected_service": "Apache httpd",
        },
        {
            "id": "CVE-2016-6662",
            "name": "MySQL Remote Root Code Execution Chain",
            "severity": "Critical",
            "cvss": 9.8,
            "description": "Privilege escalation chain allows remote attackers to execute arbitrary code as root.",
            "affected_service": "MySQL 5.7.x",
        },
        {
            "id": "CVE-2022-0543",
            "name": "Redis Lua Sandbox Escape",
            "severity": "High",
            "cvss": 8.8,
            "description": "Improperly constrained Lua execution permits command execution on vulnerable systems.",
            "affected_service": "Redis 5.0.7",
        },
    ]


async def _search_nvd_cves(service_name: str, version: str) -> List[Dict]:
    """Search NVD API for CVEs based on service name and version."""
    nvd_api_key = os.getenv("NVD_API_KEY")
    if not nvd_api_key:
        return []
    
    headers = {"apiKey": nvd_api_key}
    base_url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
    
    # Try different search patterns
    search_patterns = [
        f"{service_name} {version}",
        f"{service_name}",
        version
    ]
    
    all_cves = []
    
    for pattern in search_patterns:
        try:
            params = {
                "keywordSearch": pattern,
                "resultsPerPage": 20,
                "cvssV3Severity": "HIGH"
            }
            
            response = requests.get(base_url, headers=headers, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                vulnerabilities = data.get("vulnerabilities", [])
                
                for vuln in vulnerabilities:
                    cve = vuln.get("cve", {})
                    cve_id = cve.get("id", "")
                    
                    # Get CVSS score
                    cvss_score = 0.0
                    severity = "Unknown"
                    
                    if "metrics" in cve:
                        cvss_data = cve["metrics"][0].get("cvssV3_1", {}) if cve["metrics"] else {}
                        cvss_score = cvss_data.get("baseScore", 0.0)
                        severity = cvss_data.get("baseSeverity", "Unknown")
                    
                    # Get description
                    description = ""
                    if "descriptions" in cve:
                        for desc in cve["descriptions"]:
                            if desc.get("lang") == "en":
                                description = desc.get("value", "")
                                break
                    
                    if cvss_score > 0:  # Only include CVEs with CVSS scores
                        all_cves.append({
                            "id": cve_id,
                            "name": f"{service_name} {version} Vulnerability",
                            "severity": severity,
                            "cvss": cvss_score,
                            "description": description[:300] + "..." if len(description) > 300 else description,
                            "affected_service": f"{service_name} {version}"
                        })
                        
        except Exception as e:
            print(f"NVD API search error for pattern '{pattern}': {e}")
            continue
    
    # Sort by CVSS score (descending) and limit results
    all_cves.sort(key=lambda x: x["cvss"], reverse=True)
    return all_cves[:10]  # Return top 10 CVEs


async def _extract_services_from_scan(scan_data: Dict) -> List[Dict]:
    """Extract service information from scan results."""
    services = []
    
    for port, info in scan_data.items():
        if isinstance(info, dict) and info.get("state") == "open":
            service_name = info.get("name", "").lower()
            product = info.get("product", "").lower()
            version = info.get("version", "").lower()
            
            # Combine service info for better search results
            full_service = product or service_name
            if version:
                full_service += f" {version}"
            
            services.append({
                "port": port,
                "name": service_name,
                "product": product,
                "version": version,
                "full_service": full_service
            })
    
    return services


async def analyze(recon_data: dict, scan_data: dict, is_demo: bool, queue: asyncio.Queue) -> list[dict]:
    await queue.put({"phase": "analysis", "status": "running", "message": "Normalizing service fingerprints..."})
    await asyncio.sleep(0.5)
    
    if is_demo:
        # Use demo data for demo mode
        await queue.put({"phase": "analysis", "status": "running", "message": "Correlating software versions with CVE corpus (demo mode)..."})
        await asyncio.sleep(0.8)
        await queue.put({"phase": "analysis", "status": "running", "message": "Scoring findings with CVSS and exploitability metadata..."})
        await asyncio.sleep(0.8)
        return _demo_cves()
    
    await queue.put({"phase": "analysis", "status": "running", "message": "Extracting services from scan results..."})
    
    # Extract services from scan data
    services = await _extract_services_from_scan(scan_data)
    
    if not services:
        await queue.put({"phase": "analysis", "status": "running", "message": "No services found for vulnerability analysis"})
        return []
    
    await queue.put({"phase": "analysis", "status": "running", "message": f"Searching NVD database for {len(services)} services..."})
    
    all_vulnerabilities = []
    
    for service in services:
        await queue.put({"phase": "analysis", "status": "running", 
                        "message": f"Searching CVEs for {service['full_service']} on port {service['port']}"})
        
        # Search for CVEs
        cves = await _search_nvd_cves(service['product'] or service['name'], service['version'])
        
        # Add port information to each CVE
        for cve in cves:
            cve['port'] = service['port']
            all_vulnerabilities.append(cve)
        
        await asyncio.sleep(0.2)  # Small delay to avoid rate limiting
    
    await queue.put({"phase": "analysis", "status": "running", "message": "Scoring and prioritizing findings..."})
    
    # Sort by CVSS score and limit results
    all_vulnerabilities.sort(key=lambda x: x["cvss"], reverse=True)
    
    await queue.put({"phase": "analysis", "status": "running", 
                    "message": f"Analysis complete. Found {len(all_vulnerabilities)} potential vulnerabilities"})
    
    return all_vulnerabilities[:20]  # Return top 20 vulnerabilities
