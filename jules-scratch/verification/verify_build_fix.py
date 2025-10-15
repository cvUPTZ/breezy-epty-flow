import re
from playwright.sync_api import Page, expect

def test_voice_chat_functionality(page: Page):
    """
    This test verifies that the application loads correctly after the build fix.
    """
    # 1. Arrange: Go to the authentication page.
    page.goto("http://localhost:8080/auth")

    # 2. Assert: Check that the login form is visible.
    expect(page.get_by_label("Email")).to_be_visible()
    expect(page.get_by_label("Password")).to_be_visible()
    expect(page.get_by_role("button", name="Login")).to_be_visible()

    # 3. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")