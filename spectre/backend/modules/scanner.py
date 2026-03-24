import asyncio
import nmap
import socket
from typing import Dict


def _demo_scan_payload() -> dict:
    return {
        "22": {"state": "open", "name": "ssh", "product": "OpenSSH", "version": "7.2p2 Ubuntu 4ubuntu2.10"},
        "80": {"state": "open", "name": "http", "product": "Apache httpd", "version": "2.4.18"},
        "443": {"state": "open", "name": "https", "product": "Apache httpd", "version": "2.4.18"},
        "3306": {"state": "open", "name": "mysql", "product": "MySQL", "version": "5.7.35"},
        "6379": {"state": "open", "name": "redis", "product": "Redis", "version": "5.0.7"},
    }


async def _resolve_target(target: str) -> str:
    """Resolve hostname to IP address for nmap."""
    try:
        # If it's already an IP, return as is
        socket.inet_aton(target)
        return target
    except socket.error:
        # It's a hostname, resolve it
        try:
            ip = socket.gethostbyname(target)
            return ip
        except socket.gaierror:
            raise ValueError(f"Unable to resolve hostname: {target}")


async def _perform_nmap_scan(target: str, queue: asyncio.Queue) -> Dict:
    """Perform real nmap scan with service detection."""
    try:
        # Initialize nmap scanner
        nm = nmap.PortScanner()
        
        # Resolve target to IP
        ip_target = await _resolve_target(target)
        
        await queue.put({"phase": "scan", "status": "running", 
                        "message": f"Starting SYN scan on {ip_target}..."})
        
        # Perform scan with service detection and version detection
        # -sS: SYN scan (requires root, but we'll fallback to -sT if needed)
        # -sV: Version detection
        # -O: OS detection (optional, can be slow)
        # -F: Fast scan (100 ports)
        scan_arguments = "-sV -F --version-intensity 3"
        
        try:
            # Try SYN scan first
            scan_result = nm.scan(ip_target, arguments=scan_arguments)
        except nmap.PortScannerError:
            # Fallback to TCP connect scan if SYN scan fails
            await queue.put({"phase": "scan", "status": "running", 
                            "message": "SYN scan failed, switching to TCP connect scan..."})
            scan_arguments = "-sT -sV -F --version-intensity 3"
            scan_result = nm.scan(ip_target, arguments=scan_arguments)
        
        await queue.put({"phase": "scan", "status": "running", 
                        "message": "Scan complete, processing results..."})
        
        # Process scan results
        results = {}
        
        if ip_target in nm.all_hosts():
            host_info = nm[ip_target]
            
            # Get all TCP ports
            if 'tcp' in host_info.all_protocols():
                tcp_ports = host_info.all_tcp()
                
                for port in tcp_ports:
                    port_info = host_info['tcp'][port]
                    
                    if port_info['state'] == 'open':
                        service_name = port_info.get('name', 'unknown')
                        product = port_info.get('product', '')
                        version = port_info.get('version', '')
                        extra_info = port_info.get('extrainfo', '')
                        
                        # Format service info
                        full_product = product
                        if version:
                            full_product += f" {version}"
                        if extra_info:
                            full_product += f" ({extra_info})"
                        
                        results[str(port)] = {
                            "state": port_info['state'],
                            "name": service_name,
                            "product": product or service_name,
                            "version": version or "unknown",
                            "extrainfo": extra_info,
                            "full_service": full_product
                        }
                        
                        await queue.put({
                            "phase": "scan", 
                            "status": "running", 
                            "message": f"Open {port}/tcp - {service_name} ({full_product})"
                        })
        
        return results
        
    except Exception as e:
        await queue.put({"phase": "scan", "status": "running", 
                        "message": f"Scan error: {str(e)}"})
        print(f"Nmap scan failed: {e}")
        return {}


async def perform_scan(target: str, is_demo: bool, queue: asyncio.Queue) -> dict:
    if is_demo:
        # Use demo mode
        await queue.put({"phase": "scan", "status": "running", "message": f"Launching SYN scan profile against {target} (simulated)..."})
        await asyncio.sleep(0.9)

        results = _demo_scan_payload()
        for port, service in results.items():
            await queue.put(
                {
                    "phase": "scan",
                    "status": "running",
                    "message": f"Open {port}/tcp - {service['name']} ({service['product']} {service['version']})",
                }
            )
            await asyncio.sleep(0.45)

        return results
    
    # Live mode - perform real scan
    await queue.put({"phase": "scan", "status": "running", 
                    "message": f"Initializing real port scan against {target}..."})
    
    try:
        results = await _perform_nmap_scan(target, queue)
        
        await queue.put({"phase": "scan", "status": "running", 
                        "message": f"Scan completed. Found {len(results)} open ports."})
        
        return results
        
    except ValueError as e:
        await queue.put({"phase": "scan", "status": "running", 
                        "message": f"Target resolution failed: {str(e)}"})
        return {}
    except Exception as e:
        await queue.put({"phase": "scan", "status": "running", 
                        "message": f"Scan failed: {str(e)}"})
        return {}
