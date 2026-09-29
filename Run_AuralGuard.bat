@echo off
title AuralGuard AI Noise Intelligence System Launcher
echo ============================================================
echo   AURALGUARD — AI Noise Intelligence Platform Launcher
echo ============================================================
echo.

cd /d "%~dp0"

if not exist "venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found in venv\Scripts\python.exe
    echo Please make sure the venv directory exists.
    pause
    exit /b 1
)

echo [1/2] Starting AuralGuard FastAPI Server on http://127.0.0.1:8000...
start "AuralGuard Backend Server" /min "venv\Scripts\python.exe" -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload

echo [2/2] Waiting for server initialization...
timeout /t 3 /nobreak >nul

echo Opening AuralGuard Platform in your default browser...
start http://127.0.0.1:8000/app/

echo.
echo ============================================================
echo   AuralGuard Platform is live!
echo   Website URL : http://127.0.0.1:8000/app/
echo   API Docs    : http://127.0.0.1:8000/docs
echo ============================================================
echo   Keep this window open while using AuralGuard.
echo.
pause
