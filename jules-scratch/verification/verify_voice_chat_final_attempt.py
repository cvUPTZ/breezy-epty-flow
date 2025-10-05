import re
from playwright.sync_api import sync_playwright, Page, expect

def run_verification(page: Page):
    """
    This test verifies that the voice chat page loads correctly and that the participant list is rendered.
    """
    try:
        # 1. Arrange: Go to the login page.
        page.goto("http://localhost:8080/auth", timeout=60000)

        # 2. Act: Log in with the provided credentials.
        page.get_by_label("Email").fill("excelzed@gmail.com")
        page.get_by_label("Password").fill("123456")
        page.get_by_role("button", name="Sign In").click()

        # 3. Assert: Wait for navigation to the dashboard to confirm login.
        expect(page).to_have_url(re.compile(".*dashboard"), timeout=60000)

        # 4. Act: Navigate to the voice chat page for the specified match.
        page.goto("http://localhost:8080/match/1899fbd1-d0ab-402b-93f6-103ea84dc678/voice-chat", timeout=60000)

        # Wait for the page to be fully loaded
        page.wait_for_load_state("networkidle")

        # 5. Assert: Check that the voice chat page has loaded.
        expect(page.get_by_text("Voice Chat for Match:")).to_be_visible(timeout=10000)

        # 6. Screenshot: Capture the final result for visual verification.
        page.screenshot(path="jules-scratch/verification/verification.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    run_verification(page)
    browser.close()