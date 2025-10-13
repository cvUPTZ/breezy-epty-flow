from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the login page
        page.goto("http://localhost:8080/auth")

        # Log in as the test admin user
        page.get_by_label("Email").fill("admin@example.com")
        page.get_by_label("Password").fill("password")
        page.get_by_role("button", name="Sign In").click()

        # Wait for navigation to the dashboard or a logged-in state
        expect(page).to_have_url("http://localhost:8080/")

        # Navigate to the match analysis page
        match_id = "123e4567-e89b-12d3-a456-426614174000"
        page.goto(f"http://localhost:8080/match/{match_id}")

        # Wait for the page to load and check for the main content
        expect(page.get_by_text("Dashboard")).to_be_visible(timeout=10000)

        # Take a screenshot to verify the page loads correctly
        page.screenshot(path="jules-scratch/verification/verification.png")
        print("Screenshot taken successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)