import os
import sys
import time
import shutil
import asyncio
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
import edge_tts

DOCS_DIR = Path("docs")
DOCS_DIR.mkdir(parents=True, exist_ok=True)
TEMP_VIDEO_DIR = DOCS_DIR / "temp_record"
TEMP_VIDEO_DIR.mkdir(parents=True, exist_ok=True)

NARRATION_PATH = DOCS_DIR / "narration.mp3"
FINAL_VIDEO_PATH = DOCS_DIR / "milestonepay_demo_video.mp4"

NARRATION_SCRIPT = """Welcome to MilestonePay AI, an autonomous contract decomposition, visual Bryntum Gantt milestone tracker, and headless escrow payout engine competing in the PayPal AI Hackathon 2026.

Freelancers and tech enterprises lose billions annually to scope creep, delayed milestone payments, and client ghosting. MilestonePay AI solves this end-to-end.

Let us begin by clicking Decompose SOW. Here, raw freelance agreements or Statements of Work are ingested and analyzed by Google Gemini 2.5 Flash. In real time, Gemini reads the clauses, extracts discrete deliverables, computes End-to-Start dependency trees, and balances escrow values.

The decomposed deliverables are instantly mapped into the native Bryntum Gantt project model. Notice the interactive timeline with SVG dependency connectors, milestone diamonds, progress bars, and critical path highlights. Mats Bryntse, CEO of Bryntum, will appreciate that our data model strictly follows Bryntum standard schemas, complete with full JSON export capabilities.

Upon contract signing, the entire budget is committed into the PayPal Developer Sandbox using an Orders v2 Authorize call. Funds remain securely locked in the escrow vault.

When the contractor delivers their work via a GitHub Pull Request, our autonomous verification agent audits the commit SHA, executes automated test assertions, and calculates an immutable SHA-256 deliverable proof.

Once verified, the server triggers a headless PayPal capture directly on the milestone allocation. The funds are disbursed instantly with celebratory confirmation and tamper-proof receipts.

MilestonePay AI features enterprise multi-tenancy with SQLAlchemy ORM, JWT authentication, real GitHub PR webhooks, and an automatic 2 percent platform monetization take-rate.

Thank you for experiencing MilestonePay AI, the future of autonomous milestone finance.
"""

async def generate_voiceover(audio_path: Path):
    print("[1/3] Generating Neural Voiceover using edge-tts (en-US-ChristopherNeural)...")
    tts = edge_tts.Communicate(NARRATION_SCRIPT, "en-US-ChristopherNeural")
    await tts.save(str(audio_path))
    print(f"  [OK] Voiceover saved to {audio_path}")

def get_audio_duration(audio_path: Path) -> float:
    cmd = ["ffmpeg", "-i", str(audio_path)]
    p = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    for line in p.stderr.splitlines():
        if "Duration:" in line:
            parts = line.split("Duration:")[1].split(",")[0].strip().split(":")
            hours = float(parts[0])
            minutes = float(parts[1])
            seconds = float(parts[2])
            return hours * 3600 + minutes * 60 + seconds
    return 128.0

def safe_click(page, selector: str, timeout: int = 5000):
    try:
        page.wait_for_selector(selector, timeout=timeout)
        page.click(selector, timeout=timeout)
        return True
    except Exception as e:
        print(f"    (Note: selector '{selector}' skipped: {e})")
        return False

def record_browser_interaction(record_dir: Path, target_duration: float) -> Path:
    print(f"[2/3] Recording Browser Session with Playwright (Target ~{int(target_duration)}s)...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            device_scale_factor=1.0,
            record_video_dir=str(record_dir),
            record_video_size={"width": 1920, "height": 1080},
            color_scheme="dark"
        )
        page = context.new_page()

        start_time = time.time()
        print("  -> Loading MilestonePay AI Dashboard...")
        page.goto("http://localhost:5173", wait_until="networkidle")
        page.wait_for_timeout(4000)

        # 1. Inspect Top KPI Cards & Presets
        print("  -> Exploring Escrow Summary & KPI metrics...")
        page.mouse.move(300, 160)
        page.wait_for_timeout(2500)
        page.mouse.move(600, 160)
        page.wait_for_timeout(2500)
        page.mouse.move(900, 160)
        page.wait_for_timeout(2500)

        # 2. Decompose SOW Flow
        print("  -> Opening Gemini 2.5 Flash Contract Decomposer...")
        safe_click(page, "button:has-text('+ Decompose SOW')")
        page.wait_for_timeout(3500)

        # Click preset inside modal
        safe_click(page, "button:has-text('Web3 DeFi')")
        page.wait_for_timeout(2500)

        # Click Decompose
        print("  -> Running Gemini 2.5 Flash Decomposition...")
        safe_click(page, "button:has-text('Decompose with Gemini')")
        page.wait_for_timeout(6000)

        # 3. Bryntum Gantt Engine Interactions
        print("  -> Interacting with Bryntum Gantt Engine...")
        # Toggle Critical Path
        safe_click(page, "button:has-text('Critical Path')")
        page.wait_for_timeout(3000)
        safe_click(page, "button:has-text('Critical Path')")
        page.wait_for_timeout(2500)

        # Switch zoom
        safe_click(page, "button:has-text('Compact')")
        page.wait_for_timeout(3000)
        safe_click(page, "button:has-text('Day')")
        page.wait_for_timeout(3000)

        # Open Bryntum JSON Modal
        print("  -> Inspecting Bryntum JSON Schema standard...")
        safe_click(page, "button:has-text('Bryntum JSON')")
        page.wait_for_timeout(3500)

        safe_click(page, "button:has-text('Tasks')")
        page.wait_for_timeout(3000)
        safe_click(page, "button:has-text('Dependencies')")
        page.wait_for_timeout(3000)
        safe_click(page, "button:has-text('Calendars')")
        page.wait_for_timeout(3000)

        # Close Bryntum Modal
        safe_click(page, "button[aria-label='Close modal']")
        page.keyboard.press("Escape")
        page.wait_for_timeout(2500)

        # 4. Cryptographic PR Verification & PayPal Release
        print("  -> Triggering Deliverable Verification & Payout...")
        # Click quick release next milestone or a verify button
        clicked = safe_click(page, "button:has-text('Verify & Pay Next Milestone')")
        if not clicked:
            safe_click(page, "button:has-text('Verify & Pay')")
        page.wait_for_timeout(3500)

        # Inside Verification Modal, click Audit PR & Release Escrow
        print("  -> Auditing PR & Executing Headless PayPal Capture...")
        safe_click(page, "button:has-text('Audit PR & Release')")
        page.wait_for_timeout(7000) # Wait for animation steps & confetti

        # Click Done & Update Gantt Timeline
        done_clicked = safe_click(page, "button:has-text('Done & Update Gantt Timeline')")
        if not done_clicked:
            safe_click(page, "button[aria-label='Close modal']")
        page.wait_for_timeout(3500)

        # 5. Cryptographic Audit Ledger & Take-Rate
        print("  -> Inspecting Cryptographic Audit Ledger & 2% Take-Rate...")
        page.evaluate("window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })")
        page.wait_for_timeout(4500)

        # Click PayPal Captures filter
        safe_click(page, "button:has-text('PayPal Captures')")
        page.wait_for_timeout(3500)

        safe_click(page, "button:has-text('All')")
        page.wait_for_timeout(3500)

        # Scroll smoothly back to top
        page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
        page.wait_for_timeout(3500)

        # Fill any remaining time until target duration
        elapsed = time.time() - start_time
        remaining = target_duration - elapsed
        if remaining > 0:
            print(f"  -> Padding remaining {int(remaining)}s to synchronize with narration...")
            page.wait_for_timeout(int(remaining * 1000))

        page.close()
        context.close()
        browser.close()

    # Locate generated video file in record_dir
    video_files = list(record_dir.glob("*.webm"))
    if not video_files:
        raise RuntimeError("No recorded video found in Playwright recording directory!")
    
    # Return latest webm file
    latest_video = max(video_files, key=os.path.getctime)
    print(f"  [OK] Raw browser video recorded: {latest_video}")
    return latest_video

def merge_video_and_audio(raw_video: Path, audio_path: Path, output_mp4: Path):
    print("[3/3] Merging Video and Audio with FFmpeg (H.264 / AAC 1080p)...")
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-i", str(raw_video),
        "-i", str(audio_path),
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        str(output_mp4)
    ]
    
    res = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("[FFmpeg Error]:", res.stderr)
        raise RuntimeError(f"FFmpeg failed with exit code {res.returncode}")

    print(f"  [OK] Final production demo video ready: {output_mp4}")
    file_size_mb = output_mp4.stat().st_size / (1024 * 1024)
    print(f"  [OK] Video file size: {file_size_mb:.2f} MB")

def main():
    print("=" * 70)
    print("  MILESTONEPAY AI - AUTOMATED VIDEO PRODUCTION PIPELINE")
    print("=" * 70)

    # 1. Voiceover
    if not NARRATION_PATH.exists():
        asyncio.run(generate_voiceover(NARRATION_PATH))
    else:
        print(f"[1/3] Using pre-generated voiceover at {NARRATION_PATH}")
        
    audio_duration = get_audio_duration(NARRATION_PATH)
    print(f"  Narration length: {audio_duration:.2f} seconds")

    # 2. Browser Recording
    raw_video = record_browser_interaction(TEMP_VIDEO_DIR, target_duration=audio_duration + 2.0)

    # 3. FFmpeg Merge
    merge_video_and_audio(raw_video, NARRATION_PATH, FINAL_VIDEO_PATH)

    # Clean up temp webm recording dir
    try:
        shutil.rmtree(TEMP_VIDEO_DIR)
    except Exception:
        pass

    print("=" * 70)
    print(f"SUCCESS! Output Video: {FINAL_VIDEO_PATH.resolve()}")
    print("=" * 70)

if __name__ == "__main__":
    main()
