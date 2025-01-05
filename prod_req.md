1. Create a **Chrome extension** with a popup UI that opens when the user clicks the extension icon in the browser.

2. Include a **text input field** in the Chrome extension popup for the user to type a one-line description of the task they just completed.

3. Add a **"Log" button** in the extension popup that saves the user’s one-liner log entry to local storage.

4. Automatically capture and store the **current active tab's URL** when the user logs a task through the extension.

5. Automatically capture and store a **screenshot of the active tab** when the user logs a task through the extension.

6. Automatically capture and store the **current timestamp** when the user logs a task through the extension.

7. Display a **daily karma point count** in the extension popup based on the number of items logged that day.

8. Display a **daily target count** (set by the user) in the extension popup and show progress toward that target.

9. Include a **button in the extension popup** that opens the companion web app in a new browser tab.

10. Implement a **passive snapshot system** that, every 30 minutes, automatically captures and stores:
   - The active tab’s URL.
   - A screenshot of the active tab.
   - The timestamp of the snapshot.

11. Build a **web app** that opens in a new browser tab when the user clicks the button in the Chrome extension.

12. In the web app, display a **GitHub-style green dot activity graph** that visually represents the user’s logged activities over time.

13. Provide a **list view in the web app** that shows all logged items in a structured, date-wise timeline.

14. In the list view, show the following details for each logged item:
   - The user’s one-line task description.
   - The corresponding URL.
   - The timestamp of when the item was logged.

15. Allow the user to **scroll through the timeline view vertically** in the web app to see their logged tasks chronologically.

16. Provide a **sorting option** in the list view to sort tasks by **newest or oldest**.

17. Ensure that **all data is stored locally** on the user’s device with no cloud integration.

18. Allow the user to **set a daily karma point target** through the web app.

19. Ensure the extension popup displays **karma progress for the current day** based on tasks logged versus the daily target.

20. Ensure the Chrome extension and web app have a **minimalistic design inspired by Uber’s UI style**, with a focus on simplicity and usability.

21. Ensure that the Chrome extension **requires no login or sign-up process** for usage.

22. Ensure the web app shows a **summary of daily, weekly, and monthly karma points** in the GitHub-style activity graph.

23. Include a **"Reset Data" option** in the web app to allow users to wipe all logged data if needed.

24. Ensure that the Chrome extension and web app are **fully functional offline** without any internet connectivity.