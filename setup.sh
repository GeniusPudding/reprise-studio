#!/usr/bin/env bash
# One-line bootstrap: creates the Python venv, installs Python + Node deps.
#
#     bash setup.sh
#
# After it finishes:
#     source .venv/bin/activate   (or .venv/Scripts/activate on Git Bash/Windows)
#     npm run dev

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

PY="${PYTHON:-python3}"
if ! command -v "$PY" >/dev/null 2>&1; then
  PY=python
fi

echo "▸ Using Python: $($PY --version)"
echo "▸ Using Node:   $(node --version 2>/dev/null || echo '(missing — install Node 18+)')"

if [ ! -d ".venv" ]; then
  echo "▸ Creating .venv ..."
  "$PY" -m venv .venv
fi

# Pick the right activate path for Windows vs POSIX.
if [ -f ".venv/Scripts/activate" ]; then
  # shellcheck disable=SC1091
  source .venv/Scripts/activate
else
  # shellcheck disable=SC1091
  source .venv/bin/activate
fi

echo "▸ Upgrading pip ..."
python -m pip install --upgrade pip wheel

echo "▸ Installing Python requirements (scripts/requirements.txt) ..."
pip install -r scripts/requirements.txt

echo "▸ Installing Node dependencies (npm install) ..."
npm install

echo ""
echo "✓ Setup complete."
echo "  Activate venv:  source .venv/bin/activate   (or .venv/Scripts/activate on Windows)"
echo "  Run dev server: npm run dev"
