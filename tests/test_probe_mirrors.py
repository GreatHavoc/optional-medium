"""Verify the two-consecutive-failure rule without network calls."""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "probe_mirrors", ROOT / "scripts" / "probe_mirrors.py"
)
probe_mod = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(probe_mod)

INITIAL = {
    "updated": "2026-01-01T00:00:00Z",
    "mirrors": [
        {"host": "healthy.example.com", "up": True, "failCount": 0},
        {"host": "failing.example.com", "up": True, "failCount": 1},
    ],
}


class ProbeTests(unittest.TestCase):
    def run_probe(self, results):
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "mirrors.json"
            target.write_text(json.dumps(INITIAL), encoding="utf-8")
            with patch.object(probe_mod, "TARGET", target), \
                 patch.object(probe_mod, "probe", side_effect=results):
                probe_mod.main()
            return json.loads(target.read_text(encoding="utf-8"))

    def test_success_resets_counter(self):
        data = self.run_probe([True, True])
        mirrors = {m["host"]: m for m in data["mirrors"]}
        self.assertEqual(mirrors["healthy.example.com"]["failCount"], 0)
        self.assertTrue(mirrors["healthy.example.com"]["up"])

    def test_second_failure_marks_down(self):
        data = self.run_probe([True, False])
        mirrors = {m["host"]: m for m in data["mirrors"]}
        self.assertEqual(mirrors["failing.example.com"]["failCount"], 2)
        self.assertFalse(mirrors["failing.example.com"]["up"])

    def test_timestamp_is_updated(self):
        data = self.run_probe([True, True])
        self.assertNotEqual(data["updated"], INITIAL["updated"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
