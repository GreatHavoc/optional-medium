"""Probe Freedium mirrors and update mirrors.json.

Runs in a GitHub Action on a schedule, never on a user device. A mirror is
marked down after two consecutive failures so a single slow response does not
switch every reader at once.
"""
import json
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "mirrors.json"
TIMEOUT = 10
FAIL_LIMIT = 2


def probe(host):
    req = urllib.request.Request(
        f"https://{host}/",
        headers={"User-Agent": "optional-medium-health-check/2.0"},
    )
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as res:
            return 200 <= res.status < 400
    except (urllib.error.URLError, TimeoutError, OSError):
        return False


def main():
    data = json.loads(TARGET.read_text(encoding="utf-8"))
    for mirror in data.get("mirrors", []):
        host = mirror.get("host", "")
        if not host:
            continue
        ok = probe(host)
        mirror["failCount"] = 0 if ok else int(mirror.get("failCount", 0)) + 1
        mirror["up"] = mirror["failCount"] < FAIL_LIMIT
        print(f"{host}: {'up' if mirror['up'] else 'down'} "
              f"(failCount={mirror['failCount']})")

    data["updated"] = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    TARGET.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
