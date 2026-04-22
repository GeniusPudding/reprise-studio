# One-line bootstrap for Windows PowerShell:
#     powershell -ExecutionPolicy Bypass -File setup.ps1
#
# After it finishes:
#     .\.venv\Scripts\Activate.ps1
#     npm run dev

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

$py = Get-Command python -ErrorAction SilentlyContinue
if (-not $py) { $py = Get-Command py -ErrorAction SilentlyContinue }
if (-not $py) { throw "Python not found on PATH. Install Python 3.10+." }

Write-Host "▸ Using Python: $(python --version 2>&1)"
Write-Host "▸ Using Node:   $(node --version 2>&1)"

if (-not (Test-Path ".venv")) {
    Write-Host "▸ Creating .venv ..."
    python -m venv .venv
}

. .\.venv\Scripts\Activate.ps1

Write-Host "▸ Upgrading pip ..."
python -m pip install --upgrade pip wheel

Write-Host "▸ Installing Python requirements ..."
pip install -r scripts\requirements.txt

Write-Host "▸ Installing Node dependencies ..."
npm install

Write-Host ""
Write-Host "✓ Setup complete."
Write-Host "  Activate venv:  .\.venv\Scripts\Activate.ps1"
Write-Host "  Run dev server: npm run dev"
