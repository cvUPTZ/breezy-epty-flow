from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:8080/match/1")
    page.wait_for_selector(".grid.grid-cols-2.gap-4")
    page.screenshot(path="jules-scratch/verification/combined_interface.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)