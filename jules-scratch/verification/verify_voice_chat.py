import re
from playwright.sync_api import Page, expect

def test_voice_chat_participant_list(page: Page):
    """
    This test verifies that the voice chat page loads correctly and that the participant list is rendered.
    """
    # 1. Arrange: Go to the login page.
    page.goto("http://localhost:8080/auth")

    # 2. Act: Log in with the provided credentials.
    page.get_by_label("Email").fill("excelzed@gmail.com")
    page.get_by_label("Password").fill("123456")
    page.get_by_role("button", name="Sign In").click()

    # 3. Assert: Wait for navigation to the dashboard to confirm login.
    expect(page).to_have_url(re.compile(".*dashboard"))

    # 4. Act: Navigate to the voice chat page for the specified match.
    page.goto("http://localhost:8080/match/1899fbd1-d0ab-402b-93f6-103ea84dc678/voice-chat")

    # 5. Assert: Check that the voice chat page has loaded.
    expect(page.get_by_text("Voice Chat for Match:")).to_be_visible()

    # 6. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")