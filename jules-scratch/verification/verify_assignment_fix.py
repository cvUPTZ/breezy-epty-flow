from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the auth page
        page.goto("http://localhost:8080/auth")

        # Click the "Sign Up" tab
        page.get_by_role("tab", name="Sign Up").click()

        # Fill in the sign-up form
        page.get_by_label("Full Name").fill("Test User")
        # Use a unique email to avoid conflicts on subsequent runs
        import time
        email = f"test-{int(time.time())}@example.com"
        page.get_by_label("Email").fill(email)
        page.get_by_label("Password").fill("password")
        page.get_by_role("button", name="Create Account").click()

        # Wait for navigation to the dashboard after signup
        expect(page).to_have_url("http://localhost:8080/dashboard", timeout=10000)

        # Navigate to the match analysis page
        match_id = "a1b2c3d4-e5f6-7890-1234-567890abcdef"
        page.goto(f"http://localhost:8080/matches/{match_id}/analysis-v2")

        # Wait for the page to load and take a screenshot
        expect(page.get_by_text("Match Analysis")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/verification.png")

        print("Verification successful. Screenshot saved.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)