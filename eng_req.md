1. **Create a Chrome extension manifest file (`manifest.json`)** that defines the extension's metadata, permissions (activeTab, storage, and scripting), and popup UI file.

2. **Set up a basic HTML file (`popup.html`)** for the Chrome extension popup UI that includes:
   - A text input field.
   - A "Log" button.
   - A section to display the daily karma count and target.

3. **Write a popup JavaScript file (`popup.js`)** to handle user interactions in the popup:
   - Capture the text input when the "Log" button is clicked.
   - Store the log entry, active tab URL, and timestamp in Chrome's local storage.
   - Update and display the daily karma count.

4. **Implement a Chrome tabs API call** in `popup.js` to capture the current active tab’s URL and title when the user logs a task.

5. **Add a content script (`content.js`)** to capture a screenshot of the current tab using the Chrome `chrome.tabs.captureVisibleTab` API when the user logs a task.

6. **Set up local storage** in the extension to save:
   - One-liner task descriptions.
   - URLs of active tabs.
   - Timestamps.
   - Screenshots (as base64-encoded strings).
   - Daily karma points.

7. **Implement a passive snapshot mechanism** in `background.js`:
   - Use `setInterval` to take a snapshot every 30 minutes.
   - Capture the active tab’s URL, screenshot, and timestamp.
   - Store the snapshot data in local storage.

8. **Add logic to the passive snapshot mechanism** to check if the user is inactive for a certain period and skip snapshots if no activity is detected.

9. **Create a simple web app UI (`index.html`)** that opens in a new tab when the user clicks a button in the Chrome extension popup:
   - Include a navigation bar with tabs for the activity graph view and list view.
   - Use a minimalist dark-themed design inspired by Uber.

10. **Build a GitHub-style green dot activity graph** in the web app using:
    - An HTML canvas or SVG element.
    - JavaScript to dynamically render the graph based on the stored log data.

11. **Add a list view component** in the web app to display all logged items in a vertical, date-wise timeline:
    - Show task descriptions, URLs, and timestamps.
    - Provide sorting options (newest to oldest, oldest to newest).

12. **Implement a sorting feature** in the list view using JavaScript to allow users to sort logged items based on timestamps.

13. **Add a "Daily Karma Target" setting** in the web app:
    - Include an input field for the user to set their daily target.
    - Store the target value in local storage.

14. **Modify the extension popup UI** to:
    - Display the daily karma count progress as a fraction of the target.
    - Show a progress bar that fills based on the user’s daily progress.

15. **Add a button in the Chrome extension popup** that opens the web app in a new browser tab.

16. **Ensure that the passive snapshot mechanism runs in the background** even when the Chrome extension popup is closed:
    - Use a persistent background script.

17. **Implement local storage read/write functions** in both the extension and web app to ensure:
    - Consistent data storage across the extension and web app.
    - Data is saved and retrieved efficiently.

18. **Add a "Reset Data" feature** in the web app:
    - Include a button that allows users to wipe all stored data.
    - Prompt a confirmation dialog before deleting.

19. **Implement a dark mode stylesheet** for both the extension popup and the web app to ensure a consistent minimalist design.

20. **Optimize the web app performance**:
    - Ensure the green dot activity graph loads efficiently for large datasets.
    - Minimize the size of screenshots stored in local storage.

21. **Implement an activity summary feature** in the web app:
    - Display daily, weekly, and monthly karma summaries.
    - Show totals and averages for each period.

22. **Ensure cross-platform compatibility** for the extension and web app by testing the UI on both Windows and MacOS browsers.

23. **Add smooth animations** to the extension popup and web app:
    - Animate the progress bar in the popup.
    - Animate green dots in the activity graph when data is loaded.

24. **Build a clean, reusable CSS file** for consistent styling across the Chrome extension and web app.

25. **Ensure data persistence** in local storage across browser sessions:
    - Check if stored data exists on extension startup.
    - Load existing data into the extension popup and web app on startup.