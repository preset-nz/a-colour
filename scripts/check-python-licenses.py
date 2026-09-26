#!/usr/bin/env python3
"""Licence gate for the Phase-B training tree (training/). Mirrors
scripts/check-licenses.ts for npm. Nothing here ships: the app only bundles the
exported ONNX model. The gate still runs so a copyleft dependency can't slip
into the pipeline that produces that model.

Skips cleanly when training/.venv doesn't exist (a clean clone or CI), since
the training deps are opt-in via `just train-setup`.

Allowlist or exception changes happen here AND in THIRD-PARTY.md, same commit.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

VENV_PYTHON = Path(__file__).resolve().parent.parent / "training" / ".venv" / "bin" / "python"

ALLOWED = {
    "MIT",
    "MIT-0",
    "ISC",
    "Apache-2.0",
    "BSD-2-Clause",
    "BSD-3-Clause",
    "0BSD",
    "Zlib",
    "Unlicense",
    "CC0-1.0",
    "BlueOak-1.0.0",
    "Python-2.0",
    "MIT-CMU",
    "HPND",
    "PSF-2.0",
}

# pip-licenses mixes SPDX ids with classifier names. Anything unmapped fails
# closed rather than silently passing.
NORMALISE = {
    "MIT License": "MIT",
    "BSD License": "BSD-3-Clause",
    "3-Clause BSD License": "BSD-3-Clause",
    "Apache Software License": "Apache-2.0",
    "Apache License 2.0": "Apache-2.0",
    "Python Software Foundation License": "Python-2.0",
    "ISC License (ISCL)": "ISC",
    "The Unlicense (Unlicense)": "Unlicense",
}

# Reviewed per-package exceptions. Key = package name, value = the reason.
EXCEPTIONS: dict[str, str] = {}


def licence_allowed(expr: str) -> bool:
    stripped = expr.replace("(", " ").replace(")", " ").strip()
    if re.search(r"\bOR\b", stripped):
        return any(licence_allowed(p.strip()) for p in re.split(r"\bOR\b", stripped))
    if re.search(r"\bAND\b", stripped):
        return all(licence_allowed(p.strip()) for p in re.split(r"\bAND\b", stripped))
    if ";" in stripped:
        return any(licence_allowed(p.strip()) for p in stripped.split(";"))
    return NORMALISE.get(stripped, stripped) in ALLOWED


def main() -> int:
    if not VENV_PYTHON.exists():
        print("python licence gate: training/.venv not set up, skipped (run `just train-setup`)")
        return 0

    raw = subprocess.run(
        [str(VENV_PYTHON), "-m", "piplicenses", "--format=json"],
        capture_output=True,
        text=True,
        check=True,
    ).stdout
    packages = json.loads(raw)

    violations = [
        f"  {pkg['Name']} — {pkg['License']}"
        for pkg in packages
        if pkg["Name"] not in EXCEPTIONS and not licence_allowed(pkg["License"])
    ]
    if violations:
        print("Licence gate: disallowed licences in the training tree:", file=sys.stderr)
        print("\n".join(violations), file=sys.stderr)
        return 1
    print(f"python licence gate: {len(packages)} packages, all permissive ✔")
    return 0


if __name__ == "__main__":
    sys.exit(main())
