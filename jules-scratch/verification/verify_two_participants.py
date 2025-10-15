import asyncio
from playwright.async_api import async_playwright, expect

async def run_test():
    async with async_playwright() as p:
        # --- Browser 1 ---
        browser1 = await p.chromium.launch(headless=True)
        context1 = await browser1.new_context()
        page1 = await context1.new_page()

        # --- Browser 2 ---
        browser2 = await p.chromium.launch(headless=True)
        context2 = await browser2.new_context()
        page2 = await context2.new_page()

        try:
            # --- User 1 joins ---
            await page1.goto("http://localhost:8080/auth")
            await page1.get_by_label("Email").fill("admin@example.com")
            await page1.get_by_label("Password").fill("password")
            await page1.get_by_role("button", name="Login").click()
            await expect(page1).to_have_url("http://localhost:8080/")

            match_id = "123e4567-e89b-12d3-a456-426614174000"
            await page1.goto(f"http://localhost:8080/match/{match_id}/voice-chat")

            # --- User 2 joins ---
            await page2.goto("http://localhost:8080/auth")
            await page2.get_by_label("Email").fill("admin@example.com") # Using same user for simplicity
            await page2.get_by_label("Password").fill("password")
            await page2.get_by_role("button", name="Login").click()
            await expect(page2).to_have_url("http://localhost:8080/")

            await page2.goto(f"http://localhost:8080/match/{match_id}/voice-chat")

            # --- Assertions ---
            # Wait for the room to be available and join it
            await page1.get_by_role("button", name="Join").click()
            await page2.get_by_role("button", name="Join").click()

            # Wait for both participants to appear in each other's UI
            await expect(page1.get_by_text("Participants (2)")).to_be_visible()
            await expect(page2.get_by_text("Participants (2)")).to_be_visible()

            # Take a screenshot
            await page1.screenshot(path="jules-scratch/verification/verification.png")

        finally:
            await browser1.close()
            await browser2.close()

asyncio.run(run_test())