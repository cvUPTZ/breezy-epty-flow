from playwright.sync_api import sync_playwright, expect, Page
import time

def verify_tracker_system(page: Page):
    """
    Navigates to the match page and verifies the Ball Tracker UI is loaded.
    """
    # Navigate to the match page for the specific match ID
    # This assumes the user is already logged in and has an assignment for this match.
    match_id = "1899fbd1-d0ab-402b-93f6-103ea84dc678"
    page.goto(f"http://localhost:8080/match/{match_id}")

    # The default view for a tracker is 'Piano Input', which now renders our system.
    # We need to wait for the system to load, determine the role, and render the UI.
    # The most reliable element to wait for is the title of the Ball Tracker card.

    print("Waiting for Ball Tracker Interface to load...")

    # Wait for the "Ball Tracker Interface" heading to be visible.
    # Increased timeout to 60 seconds to allow for slow server startup and data fetching.
    ball_tracker_heading = page.get_by_role("heading", name="Ball Tracker Interface")

    try:
        expect(ball_tracker_heading).to_be_visible(timeout=60000)
        print("Ball Tracker Interface found.")
    except Exception as e:
        print("Error waiting for Ball Tracker Interface:", e)
        # Save a screenshot even on failure for debugging
        page.screenshot(path="jules-scratch/verification/verification_error.png")
        raise

    # Give the UI a moment to settle completely before taking the screenshot
    time.sleep(2)

    # Take a screenshot of the entire viewport
    page.screenshot(path="jules-scratch/verification/ball_tracker_view.png")
    print("Screenshot 'ball_tracker_view.png' captured successfully.")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_tracker_system(page)
        finally:
            browser.close()

if __name__ == "__main__":
    main()