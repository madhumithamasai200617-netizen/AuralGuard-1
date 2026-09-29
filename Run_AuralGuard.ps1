Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  AURALGUARD — AI Noise Intelligence Platform Launcher" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location -Path $PSScriptRoot

if (-not (Test-Path "venv\Scripts\python.exe")) {
    Write-Host "[ERROR] Virtual environment not found in venv\Scripts\python.exe" -ForegroundColor Red
    exit 1
}

Write-Host "[1/2] Starting AuralGuard FastAPI Server on http://127.0.0.1:8000..." -ForegroundColor Green
Start-Process -FilePath "venv\Scripts\python.exe" -ArgumentList "-m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload" -WindowStyle Minimized

Start-Sleep -Seconds 3

Write-Host "[2/2] Opening AuralGuard Platform in default browser..." -ForegroundColor Green
Start-Process "http://127.0.0.1:8000/app/"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  AuralGuard Platform is live!" -ForegroundColor Green
Write-Host "  Website URL : http://127.0.0.1:8000/app/" -ForegroundColor Yellow
Write-Host "  API Docs    : http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
