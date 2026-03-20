@echo off
title SignQuest Launcher
setlocal EnableDelayedExpansion

set "ROOT=%~dp0"
set "RUNTIME=%ROOT%.runtime"
set "PY_DIR=%RUNTIME%\python"
set "NODE_DIR=%RUNTIME%\node"
set "PY=%PY_DIR%\python.exe"
set "PIP=%PY_DIR%\Scripts\pip.exe"

set "PY_VER=3.11.9"
set "NODE_VER=20.18.3"
set "PY_URL=https://www.python.org/ftp/python/%PY_VER%/python-%PY_VER%-embed-amd64.zip"
set "NODE_URL=https://nodejs.org/dist/v%NODE_VER%/node-v%NODE_VER%-win-x64.zip"
set "PIP_URL=https://bootstrap.pypa.io/get-pip.py"

if not exist "%RUNTIME%" mkdir "%RUNTIME%"

echo ============================================
echo   SignQuest Launcher
echo ============================================
echo.

REM ── Python portable runtime ─────────────────
if not exist "%PY%" (
    echo [1/4] Downloading Python %PY_VER% portable...
    powershell -NoProfile -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri '%PY_URL%' -OutFile '%RUNTIME%\python.zip'"
    if errorlevel 1 ( echo ERROR: Could not download Python. Check your internet connection. & pause & exit /b 1 )

    powershell -NoProfile -Command "$ProgressPreference='SilentlyContinue'; Expand-Archive -Path '%RUNTIME%\python.zip' -DestinationPath '%PY_DIR%' -Force"
    del "%RUNTIME%\python.zip"

    REM Enable site-packages so pip and installed packages are importable
    powershell -NoProfile -Command "Get-ChildItem '%PY_DIR%' -Filter '*._pth' | ForEach-Object { (Get-Content $_.FullName) -replace '#import site','import site' | Set-Content $_.FullName }"

    REM Bootstrap pip into the embedded Python
    powershell -NoProfile -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri '%PIP_URL%' -OutFile '%PY_DIR%\get-pip.py'"
    "%PY%" "%PY_DIR%\get-pip.py" --quiet
    del "%PY_DIR%\get-pip.py"
    echo    Python ready.
) else (
    echo [1/4] Python runtime already present, skipping.
)
echo.

REM ── Node.js portable runtime ─────────────────
if not exist "%NODE_DIR%\node.exe" (
    echo [2/4] Downloading Node.js %NODE_VER% portable...
    powershell -NoProfile -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%RUNTIME%\node.zip'"
    if errorlevel 1 ( echo ERROR: Could not download Node.js. Check your internet connection. & pause & exit /b 1 )

    powershell -NoProfile -Command "$ProgressPreference='SilentlyContinue'; Expand-Archive -Path '%RUNTIME%\node.zip' -DestinationPath '%RUNTIME%\node_tmp' -Force"
    powershell -NoProfile -Command "Move-Item '%RUNTIME%\node_tmp\node-v%NODE_VER%-win-x64' '%NODE_DIR%'"
    rmdir /s /q "%RUNTIME%\node_tmp" 2>nul
    del "%RUNTIME%\node.zip"
    echo    Node.js ready.
) else (
    echo [2/4] Node.js runtime already present, skipping.
)
echo.

REM ── Python packages ──────────────────────────
echo [3/4] Installing Python packages (first run may take several minutes)...
"%PIP%" install -r "%ROOT%ASL_Detector\requirements.txt" --quiet
if errorlevel 1 ( echo ERROR: Failed to install Python packages. & pause & exit /b 1 )
echo    Done.
echo.

REM ── Node.js packages ─────────────────────────
echo [4/4] Installing Node.js packages...
cd /d "%ROOT%my-app"
"%NODE_DIR%\npm.cmd" install --silent
if errorlevel 1 ( echo ERROR: Failed to install Node.js packages. & pause & exit /b 1 )
echo    Done.
echo.

REM ── Launch both servers ──────────────────────
echo Starting servers...

start "ASL Detector Backend" cmd /k "cd /d "%ROOT%ASL_Detector" && "%PY%" -m uvicorn main:app --host 0.0.0.0 --port 8000"
start "SignQuest Frontend"   cmd /k "cd /d "%ROOT%my-app" && "%NODE_DIR%\npm.cmd" run dev"

echo Waiting for servers to start...
timeout /t 12 /nobreak >nul
start http://localhost:3000

echo.
echo ============================================
echo   SignQuest is running!
echo   Frontend : http://localhost:3000
echo   Backend  : http://localhost:8000
echo ============================================
echo.
echo Close the server windows to stop the servers.
pause >nul
