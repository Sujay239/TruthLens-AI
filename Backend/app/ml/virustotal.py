import os
import requests
import hashlib
import time
import io
import zipfile
import math
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("VIRUSTOTAL_API_KEY")
BASE_URL = "https://www.virustotal.com/api/v3"
REQUEST_TIMEOUT_SECONDS = 30
ANALYSIS_TIMEOUT_SECONDS = 180
POLL_INTERVAL_SECONDS = 3
MAX_ARCHIVE_SCAN_DEPTH = 3
MAX_ARCHIVE_ENTRIES = 1000
MAX_ARCHIVE_MEMBER_BYTES = 10 * 1024 * 1024
EICAR_SIGNATURE = b"X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*"
SUSPICIOUS_ARCHIVE_EXTENSIONS = {".zip", ".7z", ".rar", ".tar", ".gz", ".bz2", ".xz"}
SUSPICIOUS_PAYLOAD_EXTENSIONS = {
    ".bat", ".cmd", ".com", ".dll", ".exe", ".js", ".jse", ".lnk", ".msi",
    ".ps1", ".scr", ".vbs", ".vbe", ".wsf",
}

class VirusTotalClient:
    def __init__(self):
        self.api_key = API_KEY
        self.headers = {"x-apikey": API_KEY} if API_KEY else None

    def _get_hash(self, file_bytes):
        sha256 = hashlib.sha256()
        sha256.update(file_bytes)
        return sha256.hexdigest()

    def _entropy(self, blob):
        if not blob:
            return 0.0

        counts = [0] * 256
        for byte in blob:
            counts[byte] += 1

        entropy = 0.0
        length = len(blob)
        for count in counts:
            if count:
                probability = count / length
                entropy -= probability * math.log2(probability)
        return entropy

    def _local_signature_scan(self, file_bytes, filename):
        matches = []
        suspicious_indicators = []
        inspected_entries = 0

        def extension_for(name):
            _, extension = os.path.splitext(name.lower())
            return extension

        def inspect_blob(blob, display_name, depth):
            nonlocal inspected_entries
            inspected_entries += 1

            if EICAR_SIGNATURE in blob:
                matches.append(display_name)

            extension = extension_for(display_name)
            if extension in SUSPICIOUS_PAYLOAD_EXTENSIONS:
                suspicious_indicators.append(f"executable/script payload: {display_name}")

            if (
                extension in {".bin", ".dat"}
                and len(blob) >= 32 * 1024
                and self._entropy(blob[:MAX_ARCHIVE_MEMBER_BYTES]) >= 7.5
            ):
                suspicious_indicators.append(f"high-entropy binary payload: {display_name}")

            if not zipfile.is_zipfile(io.BytesIO(blob)):
                return

            if depth > 0:
                suspicious_indicators.append(f"nested archive: {display_name}")

            if depth >= MAX_ARCHIVE_SCAN_DEPTH:
                suspicious_indicators.append(f"archive nesting exceeds scan depth: {display_name}")
                return

            try:
                with zipfile.ZipFile(io.BytesIO(blob)) as archive:
                    for index, member in enumerate(archive.infolist()):
                        if index >= MAX_ARCHIVE_ENTRIES:
                            break
                        if member.is_dir() or member.file_size > MAX_ARCHIVE_MEMBER_BYTES:
                            continue

                        nested_name = f"{display_name}!/{member.filename}"
                        try:
                            inspect_blob(archive.read(member), nested_name, depth + 1)
                        except RuntimeError:
                            continue
            except zipfile.BadZipFile:
                return

        inspect_blob(file_bytes, filename, 0)
        if not matches:
            if not suspicious_indicators:
                return None

            shown_indicators = ", ".join(dict.fromkeys(suspicious_indicators[:4]))
            if len(suspicious_indicators) > 4:
                shown_indicators += f", and {len(suspicious_indicators) - 4} more"

            return {
                "label": "Suspicious",
                "score": 45,
                "malicious_count": 0,
                "total_engines": 1,
                "threat_level": "Low",
                "signature": "Local-Archive-Heuristic",
                "analysis": (
                    "Local archive inspection did not find the EICAR test signature, "
                    f"but found suspicious archive traits: {shown_indicators}."
                ),
            }

        shown_matches = ", ".join(matches[:3])
        if len(matches) > 3:
            shown_matches += f", and {len(matches) - 3} more"

        return {
            "label": "Malicious",
            "score": 100,
            "malicious_count": 1,
            "total_engines": 1,
            "threat_level": "High",
            "signature": "EICAR-Test-File",
            "analysis": (
                "Local archive inspection found the EICAR antivirus test signature in "
                f"{shown_matches}. This is a safe test string, but scanners should flag it."
            ),
        }

    def scan_file(self, file_bytes, filename):
        """
        Scans a file by checking its hash against VirusTotal.
        If hash is unknown, it (optionally) uploads the file.
        For this implementation, we prioritize hash checking to rely on VT's massive db.
        """
        local_result = self._local_signature_scan(file_bytes, filename)
        if local_result:
            return local_result

        if not self.headers:
            return {"error": "VirusTotal Error: VIRUSTOTAL_API_KEY is missing"}

        file_hash = self._get_hash(file_bytes)
        print(f"[VirusTotal] Checking hash: {file_hash} for {filename}")
        
        # 1. Check Hash
        url = f"{BASE_URL}/files/{file_hash}"
        try:
            response = requests.get(url, headers=self.headers, timeout=REQUEST_TIMEOUT_SECONDS)
        except requests.exceptions.RequestException as e:
            return {"error": f"VirusTotal Error: {e}"}
        
        if response.status_code == 200:
            data = response.json()
            return self._parse_report(data)
        elif response.status_code == 404:
            # File not known. In a full production app, we would upload here.
            # However, for responsiveness in this demo, we might return "Unknown".
            # Or we can support upload (limit 32MB).
            print(f"[VirusTotal] Hash not found. Uploading file...")
            return self._upload_and_scan(file_bytes, filename, file_hash)
        else:
            print(f"[VirusTotal] Error: {response.status_code} - {response.text}")
            return {"error": f"VirusTotal Error: {response.status_code}"}

    def _upload_and_scan(self, file_bytes, filename, file_hash):
        # Limit size to avoid issues (VT Free has limits, but we try)
        if len(file_bytes) > 32 * 1024 * 1024:
             return {"error": "File too large for upload (Limit 32MB)"}

        url = f"{BASE_URL}/files"
        files = {"file": (filename, file_bytes)}
        try:
            response = requests.post(url, headers=self.headers, files=files, timeout=REQUEST_TIMEOUT_SECONDS)
        except requests.exceptions.RequestException as e:
            return {"error": f"Upload failed: {e}"}
        
        if response.status_code in (200, 201, 202):
            data = response.json()
            analysis_id = data['data']['id']
            # Wait for analysis to complete
            result = self._wait_for_analysis(analysis_id)
            if result.get("label") == "Pending":
                hash_result = self._get_file_report(file_hash)
                if "error" not in hash_result:
                    return hash_result
            return result
        else:
            return {"error": f"Upload failed: {response.status_code}"}

    def scan_url(self, target_url):
        if not self.headers:
            return {"error": "VirusTotal Error: VIRUSTOTAL_API_KEY is missing"}
        print(f"[VirusTotal] Scanning URL: {target_url}")
        
        # 1. Submit URL
        url = f"{BASE_URL}/urls"
        payload = {"url": target_url}
        try:
            response = requests.post(url, headers=self.headers, data=payload, timeout=REQUEST_TIMEOUT_SECONDS)
        except requests.exceptions.RequestException as e:
            return {"error": f"URL Scan failed: {e}"}
        
        if response.status_code in (200, 201, 202):
            data = response.json()
            analysis_id = data['data']['id']
            return self._wait_for_analysis(analysis_id)

        else:
             return {"error": f"URL Scan failed: {response.status_code}"}

    def _get_file_report(self, file_hash):
        url = f"{BASE_URL}/files/{file_hash}"
        try:
            response = requests.get(url, headers=self.headers, timeout=REQUEST_TIMEOUT_SECONDS)
        except requests.exceptions.RequestException as e:
            return {"error": f"VirusTotal file report unavailable: {e}"}
        if response.status_code == 200:
            return self._parse_report(response.json())
        return {"error": f"VirusTotal file report unavailable: {response.status_code}"}

    def _wait_for_analysis(self, analysis_id):
        """Polls the analysis endpoint until completion or timeout."""
        report_url = f"{BASE_URL}/analyses/{analysis_id}"
        print(f"[VirusTotal] Waiting for analysis: {analysis_id}")
        
        deadline = time.monotonic() + ANALYSIS_TIMEOUT_SECONDS
        last_status = "queued"
        while time.monotonic() < deadline:
            try:
                response = requests.get(report_url, headers=self.headers, timeout=REQUEST_TIMEOUT_SECONDS)
            except requests.exceptions.RequestException as e:
                return {"error": f"VirusTotal analysis unavailable: {e}"}
            if response.status_code == 200:
                data = response.json()
                status = data["data"]["attributes"].get("status", "queued")
                last_status = status
                if status == 'completed':
                    return self._parse_analysis(data)
            
            time.sleep(POLL_INTERVAL_SECONDS)
            
        return {
            "label": "Pending",
            "score": 0, 
            "threat_level": "Pending",
            "signature": "Pending",
            "malicious_count": 0,
            "total_engines": 0,
            "analysis": (
                "VirusTotal has not finished analyzing this item yet "
                f"(last status: {last_status}). No malicious/not-malicious verdict is available yet."
            )
        }

    def _parse_report(self, data):
        """Parses /files/{id} response"""
        attr = data['data']['attributes']
        stats = attr.get('last_analysis_stats', {})
        
        malicious = stats.get('malicious', 0)
        suspicious = stats.get('suspicious', 0)
        harmless = stats.get('harmless', 0)
        undetected = stats.get('undetected', 0)
        
        total_engines = malicious + suspicious + harmless + undetected
        score = int((malicious / total_engines) * 100) if total_engines > 0 else 0
        
        if malicious > 0:
            label = "Malicious"
            threat_level = "High" if malicious > 5 else "Medium"
        elif suspicious > 0:
            label = "Suspicious"
            threat_level = "Low"
        else:
            label = "Clean"
            threat_level = "None"
            
        engines_flagged = [
            k for k, v in attr.get('last_analysis_results', {}).items()
            if v.get('category') == 'malicious'
        ]
        top_threat = engines_flagged[0] if engines_flagged else "None"
            
        return {
            "label": label,
            "score": score, # Normalized 0-100 roughly
            "malicious_count": malicious,
            "total_engines": total_engines,
            "threat_level": threat_level,
            "signature": top_threat,
            "analysis": f"Flagged by {malicious}/{total_engines} vendors."
        }
        
    def _parse_analysis(self, data):
        """Parses /analyses/{id} response (for URL/Uploads)"""
        stats = data['data']['attributes'].get('stats', {})
        
        malicious = stats.get('malicious', 0)
        suspicious = stats.get('suspicious', 0)
        harmless = stats.get('harmless', 0)
        undetected = stats.get('undetected', 0)
        total_engines = malicious + suspicious + harmless + undetected
        score = int((malicious / total_engines) * 100) if total_engines > 0 else 0
        
        if malicious > 0:
            label = "Malicious"
            threat_level = "High"
        elif suspicious > 0:
            label = "Suspicious"
            threat_level = "Low"
        else:
            label = "Clean"
            threat_level = "None"
            
        return {
            "label": label,
            "score": score,
            "malicious_count": malicious,
            "total_engines": total_engines,
            "threat_level": threat_level,
            "signature": "URL Threat",
            "analysis": f"Flagged by {malicious}/{total_engines} vendors."
        }
