from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # The dev server runs on port 8080 as configured in vite.config.ts
        page.goto("http://localhost:8080/match/123e4567-e89b-12d3-a456-426614174000/analysis-v2")

        # Wait for the page to load and check for a key element.
        # The presence of the match header indicates the page has loaded successfully.
        expect(page.locator("text=Piano Input")).to_be_visible(timeout=20000)

        page.screenshot(path="jules-scratch/verification/verification.png")
        browser.close()

if __name__ == "__main__":
    run_verification()