import re
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Log in
    page.goto("http://localhost:8080/auth")
    page.get_by_label("Email").fill("admin@example.com")
    page.get_by_label("Password").fill("password")
    page.get_by_role("button", name="Sign In").click()

    # Wait for navigation to dashboard after login
    expect(page).to_have_url(re.compile(".*dashboard"))

    # Go to the quality control page
    page.goto("http://localhost:8080/match/123e4567-e89b-12d3-a456-426614174000/quality-control")

    # Verify the page has loaded
    expect(page.get_by_role("heading", name="Quality Control Dashboard")).to_be_visible()

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)