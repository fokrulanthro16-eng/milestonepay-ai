import subprocess
import sys
import os
import signal
import time
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"

def print_banner():
    banner = """
================================================================================
     __  __ _ _           _                      ____             _    ___ 
    |  \\/  (_) | ___  ___| |_ ___  _ __   ___   |  _ \\ __ _ _   _| |  / _ \\
    | |\\/| | | |/ _ \\/ __| __/ _ \\| '_ \\ / _ \\  | |_) / _` | | | | | | | | |
    | |  | | | |  __/\\__ \\ || (_) | | | |  __/  |  __/ (_| | |_| | | | |_| |
    |_|  |_|_|_|\\___||___/\\__\\___/|_| |_|\\___|  |_|   \\__,_|\\__, |_|  \\___/
                                                            |___/          
                  AUTONOMOUS BRYNTUM GANTT ESCROW & PAYPAL AI
================================================================================
  [>] Frontend UI:       http://localhost:5173
  [>] Backend API & Docs: http://127.0.0.1:8000/docs
  [>] PayPal Mode:       Orders v2 Sandbox (with Deterministic Mock Fallback)
  [>] AI Layer:          Google Gemini 2.5 Flash SOW Decomposition
  [>] Gantt Engine:      Bryntum Interactive Project Model Standard
================================================================================
    Press Ctrl+C to stop both servers simultaneously.
================================================================================
"""
    print(banner)

def main():
    print_banner()

    # Python executable
    python_exe = sys.executable

    # Start Backend
    print("[Launcher] Starting FastAPI backend on http://127.0.0.1:8000...")
    backend_env = os.environ.copy()
    backend_env["PYTHONPATH"] = str(BACKEND_DIR)
    
    backend_proc = subprocess.Popen(
        [python_exe, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=str(BACKEND_DIR),
        env=backend_env,
    )

    # Start Frontend
    print("[Launcher] Starting Vite React frontend on http://localhost:5173...")
    shell_flag = sys.platform == "win32"
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev", "--", "--host", "--port", "5173"],
        cwd=str(FRONTEND_DIR),
        shell=shell_flag,
    )
    def shutdown(signum, frame):
        print("\n[Launcher] Shutting down MilestonePay AI development servers...")
        try:
            if sys.platform == "win32":
                if backend_proc.poll() is None:
                    subprocess.run(f"taskkill /F /T /PID {backend_proc.pid}", shell=True, capture_output=True)
                if frontend_proc.poll() is None:
                    subprocess.run(f"taskkill /F /T /PID {frontend_proc.pid}", shell=True, capture_output=True)
            else:
                backend_proc.terminate()
                frontend_proc.terminate()
        except Exception as e:
            print(f"[Launcher] Note during shutdown: {e}")
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    try:
        while True:
            time.sleep(1)
            # Check if any process terminated unexpectedly
            if backend_proc.poll() is not None:
                print(f"[Launcher] Backend process exited unexpectedly with code {backend_proc.poll()}.")
                frontend_proc.terminate()
                break
            if frontend_proc.poll() is not None:
                print(f"[Launcher] Frontend process exited unexpectedly with code {frontend_proc.poll()}.")
                backend_proc.terminate()
                break
    except KeyboardInterrupt:
        shutdown(None, None)

if __name__ == "__main__":
    main()
