import re
from playwright.sync_api import Page, expect

def test_ball_tracker_assignment(page: Page):
    """
    This test verifies that the 'Create Assignment' button is enabled when
    'Ball Tracker' is selected, even without selecting players or event types.
    """
    # 1. Arrange: Go to the login page and authenticate.
    page.goto("http://localhost:5173/login")

    # Fill in the login credentials
    page.get_by_label("Email").fill("admin_user@example.com")
    page.get_by_label("Password").fill("fakepassword")

    # Click the sign-in button
    page.get_by_role("button", name="Sign In").click()

    # Wait for navigation to the dashboard or another authenticated page
    expect(page).to_have_url(re.compile(".*\/"), timeout=10000)

    # 2. Arrange: Go to the match edit page.
    # We assume a match with ID '1' exists for verification purposes.
    page.goto("http://localhost:5173/match/1/edit")

    # Wait for the "Tracker Management" section to be visible
    expect(page.get_by_text("Tracker Management")).to_be_visible(timeout=10000)

    # 3. Act: Select "Ball Tracker" as the assignment role.
    # Find the "Assignment Role" select and choose "Ball Tracker"
    assignment_role_selector = page.get_by_role("combobox").nth(1)
    assignment_role_selector.click()
    page.get_by_role("option", name="Ball Tracker").click()

    # 4. Act: Select a tracker from the dropdown.
    # It might take a moment for trackers to load.
    tracker_selector = page.get_by_role("combobox").first
    expect(tracker_selector).to_be_enabled(timeout=10000)
    tracker_selector.click()
    # Select the first available tracker
    page.get_by_role("option").first.click()

    # 5. Assert: Confirm the "Create Assignment" button is enabled.
    create_button = page.get_by_role("button", name="Create Assignment")
    expect(create_button).to_be_enabled()

    # 6. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/ball_tracker_enabled.png")