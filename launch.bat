@echo off
title SignQuest Launcher
setlocal

set "ROOT=%~dp0"
set "BACKEND=%ROOT%ASL_Detector"
set "FRONTEND=%ROOT%my-app"

echo ============================================
echo   SignQuest - Setting up and launching...
echo ============================================
echo.

REM Install Python requirements
echo [1/3] Installing Python requirements...
pip install -r "%BACKEND%\requirements.txt"
if errorlevel 1 (
    echo.
    echo ERROR: Failed to install Python requirements.
    echo Make sure Python and pip are installed and added to PATH.
    pause
    exit /b 1
)
echo Done.
echo.

REM Install Node.js dependencies
echo [2/3] Installing Node.js dependencies...
cd /d "%FRONTEND%"
call npm install
if errorlevel 1 (
    echo.
    echo ERROR: Failed to install Node.js dependencies.
    echo Make sure Node.js and npm are installed and added to PATH.
    pause
    exit /b 1
)
echo Done.
echo.

REM Start both servers in separate windows
echo [3/3] Starting servers...
start "ASL Detector Backend" cmd /k "cd /d "%BACKEND%" && uvicorn main:app --host 0.0.0.0 --port 8000"
start "SignQuest Frontend"   cmd /k "cd /d "%FRONTEND%" && npm run dev"

REM Wait for servers to initialise then open browser
echo Waiting for servers to start...
timeout /t 10 /nobreak >nul
start http://localhost:3000

echo.
echo ============================================
echo   SignQuest is running!
echo   Frontend : http://localhost:3000
echo   Backend  : http://localhost:8000
echo ============================================
echo.
echo The servers are running in their own windows.
echo Close those windows to stop the servers.
echo.
pause >nul
