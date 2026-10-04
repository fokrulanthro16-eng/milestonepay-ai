import os
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

OUTPUT_DIR = Path("docs/screenshots")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def take_all_screenshots():
    print("[Screenshot Pipeline] Launching Playwright in 4K Ultra-HD mode (3840x2160)...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use 2560x1440 with device_scale_factor=1.5 or 3840x2160 with scale_factor=1 for ultra crisp rendering
        context = browser.new_context(
            viewport={"width": 2560, "height": 1440},
            device_scale_factor=1.5,
            color_scheme="dark"
        )
        page = context.new_page()

        # 1. Hero Gantt Dashboard
        print("[1/5] Capturing 01_hero_gantt_dashboard.png...")
        page.goto("http://localhost:5173", wait_until="networkidle")
        page.wait_for_timeout(2000)
        
        # Ensure default preset DeFi is loaded
        hero_path = OUTPUT_DIR / "01_hero_gantt_dashboard.png"
        page.screenshot(path=str(hero_path), full_page=False)
        print(f"  [OK] Saved to {hero_path}")

        # 2. Gemini Decompose Modal
        print("[2/5] Capturing 02_gemini_decompose_modal.png...")
        # Click '+ Decompose SOW'
        page.click("text=+ Decompose SOW")
        page.wait_for_timeout(1000)
        
        modal_path = OUTPUT_DIR / "02_gemini_decompose_modal.png"
        page.screenshot(path=str(modal_path))
        print(f"  [OK] Saved to {modal_path}")

        # Close Decompose Modal
        page.keyboard.press("Escape")
        page.wait_for_timeout(500)
        # If still visible, click cancel
        cancel_btn = page.query_selector("button:has-text('Cancel')")
        if cancel_btn and cancel_btn.is_visible():
            cancel_btn.click()
            page.wait_for_timeout(500)

        # 3. Milestone Inspect & Verification Action
        print("[3/5] Capturing 03_milestone_inspect_action.png...")
        # Click on Milestone #3 or its Verify & Pay button
        verify_buttons = page.query_selector_all("button:has-text('Verify & Pay')")
        if verify_buttons:
            # Click the second or third verify button
            btn_to_click = verify_buttons[-1]
            btn_to_click.click()
            page.wait_for_timeout(1000)
        else:
            # Click on row with #3
            row = page.query_selector("text=#3")
            if row:
                row.click()
                page.wait_for_timeout(1000)

        inspect_path = OUTPUT_DIR / "03_milestone_inspect_action.png"
        page.screenshot(path=str(inspect_path))
        print(f"  [OK] Saved to {inspect_path}")

        # Close Verification Modal
        page.keyboard.press("Escape")
        page.wait_for_timeout(500)
        cancel_btn = page.query_selector("button:has-text('Cancel')")
        if cancel_btn and cancel_btn.is_visible():
            cancel_btn.click()
            page.wait_for_timeout(500)

        # 4. Cryptographic Audit Ledger
        print("[4/5] Capturing 04_cryptographic_audit_ledger.png...")
        # Scroll down to Audit Ledger
        ledger_elem = page.query_selector("text=Cryptographic Audit & Payout Ledger")
        if ledger_elem:
            ledger_elem.scroll_into_view_if_needed()
            page.wait_for_timeout(800)
        else:
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            page.wait_for_timeout(800)

        audit_path = OUTPUT_DIR / "04_cryptographic_audit_ledger.png"
        page.screenshot(path=str(audit_path))
        print(f"  [OK] Saved to {audit_path}")

        # Scroll back up
        page.evaluate("window.scrollTo(0, 0)")
        page.wait_for_timeout(500)

        # 5. Bryntum JSON Schema Modal
        print("[5/5] Capturing 05_bryntum_json_schema.png...")
        page.click("text=Bryntum JSON")
        page.wait_for_timeout(1000)

        bryntum_path = OUTPUT_DIR / "05_bryntum_json_schema.png"
        page.screenshot(path=str(bryntum_path))
        print(f"  [OK] Saved to {bryntum_path}")

        browser.close()

    print("[Screenshot Pipeline] All 5 Ultra-HD screenshots successfully captured!")

if __name__ == "__main__":
    take_all_screenshots()
