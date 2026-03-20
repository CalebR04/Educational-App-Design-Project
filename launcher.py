import os
import subprocess
import sys
import time
import webbrowser
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / "ASL_Detector"
FRONTEND_DIR = BASE_DIR / "my-app"

processes = []

def start_backend():
    backend_cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        "main:app",
        "--host",
        "127.0.0.1",
        "--port",
        "8000",
    ]
    p = subprocess.Popen(
        backend_cmd,
        cwd=BACKEND_DIR,
        creationflags=subprocess.CREATE_NEW_CONSOLE
    )
    processes.append(p)

def start_frontend():
    frontend_cmd = ["cmd", "/c", "npm run dev"]
    p = subprocess.Popen(
        frontend_cmd,
        cwd=FRONTEND_DIR,
        creationflags=subprocess.CREATE_NEW_CONSOLE
    )
    processes.append(p)

def main():
    start_backend()
    time.sleep(4)
    start_frontend()
    time.sleep(8)
    webbrowser.open("http://localhost:3000")

if __name__ == "__main__":
    main()