import asyncio
import whois
import dns.resolver
import socket
import requests
from datetime import date
from typing import Dict, List


def _demo_recon_payload(target: str) -> dict:
    return {
        "target": target,
        "whois": {
            "domain_name": target,
            "registrar": "NameCheap, Inc.",
            "creation_date": "2019-06-17",
            "updated_date": "2025-12-09",
            "expiry_date": "2027-06-17",
            "name_servers": ["ns1.cloudflare.com", "ns2.cloudflare.com"],
            "org": "Demo Target Labs LLC",
            "country": "US",
        },
        "dns": {
            "a_records": ["185.199.108.153", "185.199.109.153"],
            "aaaa_records": ["2606:50c0:8000::153"],
            "mx_records": ["10 mail.demo-target.local"],
            "txt_records": ["v=spf1 include:_spf.google.com ~all"],
            "cname_records": {"www": target, "api": f"edge.{target}"},
        },
        "subdomains": [
            f"www.{target}",
            f"api.{target}",
            f"dev.{target}",
            f"staging.{target}",
            f"admin.{target}",
            f"vpn.{target}",
        ],
        "http_headers": {
            "server": "nginx/1.18.0",
            "x-powered-by": "Express",
            "strict-transport-security": "max-age=31536000; includeSubDomains",
            "x-frame-options": "SAMEORIGIN",
        },
        "as_of": str(date.today()),
    }


async def _perform_whois_lookup(target: str) -> Dict:
    """Perform real WHOIS lookup."""
    try:
        domain = target if '.' in target else f"www.{target}"
        w = whois.whois(domain)
        
        # Format dates properly
        def format_date(date_obj):
            if date_obj:
                if isinstance(date_obj, list):
                    date_obj = date_obj[0]
                return str(date_obj.date() if hasattr(date_obj, 'date') else date_obj)
            return "Unknown"
        
        return {
            "domain_name": w.domain_name or domain,
            "registrar": w.registrar or "Unknown",
            "creation_date": format_date(w.creation_date),
            "updated_date": format_date(w.last_updated),
            "expiry_date": format_date(w.expiration_date),
            "name_servers": w.name_servers or [],
            "org": w.org or "Unknown",
            "country": w.country or "Unknown",
        }
    except Exception as e:
        print(f"WHOIS lookup failed for {target}: {e}")
        return {
            "domain_name": target,
            "registrar": "Lookup Failed",
            "creation_date": "Unknown",
            "updated_date": "Unknown",
            "expiry_date": "Unknown",
            "name_servers": [],
            "org": "Unknown",
            "country": "Unknown",
            "error": str(e)
        }


async def _perform_dns_lookup(target: str) -> Dict:
    """Perform real DNS record lookup."""
    dns_records = {
        "a_records": [],
        "aaaa_records": [],
        "mx_records": [],
        "txt_records": [],
        "cname_records": {},
        "ns_records": [],
    }
    
    try:
        # A records
        try:
            answers = dns.resolver.resolve(target, 'A')
            dns_records["a_records"] = [str(rdata) for rdata in answers]
        except:
            pass
        
        # AAAA records
        try:
            answers = dns.resolver.resolve(target, 'AAAA')
            dns_records["aaaa_records"] = [str(rdata) for rdata in answers]
        except:
            pass
        
        # MX records
        try:
            answers = dns.resolver.resolve(target, 'MX')
            dns_records["mx_records"] = [f"{rdata.preference} {rdata.exchange}" for rdata in answers]
        except:
            pass
        
        # TXT records
        try:
            answers = dns.resolver.resolve(target, 'TXT')
            dns_records["txt_records"] = [str(rdata).strip('"') for rdata in answers]
        except:
            pass
        
        # CNAME records
        try:
            answers = dns.resolver.resolve(target, 'CNAME')
            for rdata in answers:
                dns_records["cname_records"][target] = str(rdata)
        except:
            pass
        
        # NS records
        try:
            answers = dns.resolver.resolve(target, 'NS')
            dns_records["ns_records"] = [str(rdata) for rdata in answers]
        except:
            pass
            
    except Exception as e:
        print(f"DNS lookup failed for {target}: {e}")
        dns_records["error"] = str(e)
    
    return dns_records


async def _discover_subdomains(target: str, queue: asyncio.Queue) -> List[str]:
    """Discover subdomains using common wordlist."""
    common_subdomains = [
        "www", "mail", "email", "webmail", "ftp", "admin", "api", "blog",
        "dev", "test", "staging", "production", "secure", "vpn", "remote",
        "portal", "shop", "store", "app", "mobile", "m", "cdn", "static",
        "assets", "images", "media", "docs", "help", "support", "wiki",
        "forum", "news", "community", "cloud", "backup", "old", "legacy",
        "new", "beta", "alpha", "demo", "preview", "stage", "uat"
    ]
    
    discovered = []
    base_domain = target if '.' in target else f"{target}.com"
    
    await queue.put({"phase": "recon", "status": "running", 
                    "message": f"Bruteforcing {len(common_subdomains)} common subdomains..."})
    
    for subdomain in common_subdomains[:20]:  # Limit to first 20 for speed
        full_domain = f"{subdomain}.{base_domain}"
        try:
            # Try to resolve the subdomain
            socket.gethostbyname(full_domain)
            discovered.append(full_domain)
            await queue.put({"phase": "recon", "status": "running", 
                            "message": f"Found subdomain: {full_domain}"})
        except:
            pass  # Subdomain doesn't exist
        
        await asyncio.sleep(0.1)  # Small delay to avoid overwhelming DNS
    
    return discovered


async def _grab_http_headers(target: str) -> Dict:
    """Grab HTTP headers from target."""
    headers = {}
    
    # Try both HTTP and HTTPS
    protocols = ["http", "https"]
    
    for protocol in protocols:
        try:
            url = f"{protocol}://{target}"
            response = requests.get(url, timeout=5, allow_redirects=True, verify=False)
            
            # Extract interesting headers
            interesting_headers = [
                "server", "x-powered-by", "x-aspnet-version", "x-generator",
                "x-drupal-cache", "x-varnish", "x-frame-options", "x-content-type-options",
                "x-xss-protection", "strict-transport-security", "content-security-policy",
                "x-nginx-version", "x-php-version", "x-wordpress-version"
            ]
            
            for header in interesting_headers:
                if header in response.headers:
                    headers[header] = response.headers[header]
            
            # If we got headers from HTTPS, break (it's preferred)
            if protocol == "https" and headers:
                break
                
        except Exception as e:
            print(f"HTTP header grab failed for {protocol}://{target}: {e}")
            continue
    
    return headers


async def perform_recon(target: str, is_demo: bool, queue: asyncio.Queue) -> dict:
    if is_demo:
        # Use demo mode
        await queue.put({"phase": "recon", "status": "running", "message": f"Resolving WHOIS profile for {target}..."})
        await asyncio.sleep(0.8)
        await queue.put({"phase": "recon", "status": "running", "message": "Enumerating DNS A/AAAA/MX/TXT records..."})
        await asyncio.sleep(0.8)
        await queue.put({"phase": "recon", "status": "running", "message": "Bruteforcing common subdomain wordlist (simulated)..."})
        await asyncio.sleep(0.8)
        await queue.put({"phase": "recon", "status": "running", "message": "Fingerprinting perimeter HTTP headers..."})
        await asyncio.sleep(0.6)
        return _demo_recon_payload(target)
    
    # Live mode - perform real reconnaissance
    await queue.put({"phase": "recon", "status": "running", "message": f"Performing WHOIS lookup for {target}..."})
    whois_data = await _perform_whois_lookup(target)
    
    await queue.put({"phase": "recon", "status": "running", "message": "Enumerating DNS records..."})
    dns_data = await _perform_dns_lookup(target)
    
    await queue.put({"phase": "recon", "status": "running", "message": "Discovering subdomains..."})
    subdomains = await _discover_subdomains(target, queue)
    
    await queue.put({"phase": "recon", "status": "running", "message": "Grabbing HTTP headers..."})
    http_headers = await _grab_http_headers(target)
    
    return {
        "target": target,
        "whois": whois_data,
        "dns": dns_data,
        "subdomains": subdomains,
        "http_headers": http_headers,
        "as_of": str(date.today()),
    }
