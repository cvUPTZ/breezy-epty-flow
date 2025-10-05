from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. Navigate to the login page and log in
        page.goto("http://localhost:8080/auth")
        page.get_by_label("Email").fill("jules@swe.com")
        page.get_by_label("Password").fill("thisisapassword")
        page.get_by_role("button", name="Sign In").click()

        # Wait for navigation to the dashboard to confirm login
        expect(page).to_have_url("http://localhost:8080/dashboard", timeout=10000)
        print("Login successful.")

        # 2. Navigate to the matches page
        page.goto("http://localhost:8080/matches")
        expect(page).to_have_url("http://localhost:8080/matches", timeout=10000)
        print("Navigated to matches page.")

        # 3. Extract the matchId from the first match link
        # The link is expected to be within a role 'row'
        first_match_link = page.locator('a[href^="/match/"]:not([href*="voice-chat"])').first

        # Wait for the link to be visible
        first_match_link.wait_for(state="visible", timeout=10000)

        href = first_match_link.get_attribute("href")
        if not href:
            raise Exception("Could not find a match link.")

        match_id = href.split('/')[2]
        print(f"Found match ID: {match_id}")

        # 4. Navigate to the voice chat page
        voice_chat_url = f"http://localhost:8080/match/{match_id}/voice-chat"
        page.goto(voice_chat_url)
        expect(page).to_have_url(voice_chat_url, timeout=10000)
        print(f"Navigated to voice chat page for match {match_id}.")

        # 5. Take a screenshot of the voice chat page
        page.screenshot(path="jules-scratch/verification/voice_chat_verification.png")
        print("Screenshot taken successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)