# Chapter 5 — Browser-Specific Manipulation

## URLs

- `https://bonigarcia.dev/selenium-webdriver-java/geolocation.html`
- `https://bonigarcia.dev/selenium-webdriver-java/notifications.html`
- `https://bonigarcia.dev/selenium-webdriver-java/get-user-media.html`
- `https://bonigarcia.dev/selenium-webdriver-java/multilanguage.html`
- `https://bonigarcia.dev/selenium-webdriver-java/console-logs.html`
- `https://bonigarcia.dev/selenium-webdriver-java/index.html`

## Overview

Test browser APIs that require permissions or device access, including geolocation, notifications, camera access, language localization, and console output capture.

---

## Geolocation

- Verify the page heading and the coordinates button are visible.
- Verify the coordinates display area is empty before any interaction.
- Grant geolocation permission with mocked coordinates and click the button; verify the page displays the coordinates.
- Verify the displayed latitude and longitude values match the mocked coordinates exactly.
- Change the mocked coordinates to new values and verify the page updates to reflect them.
- Verify the latitude value is displayed with a degree symbol.
- Deny geolocation permission and verify the page handles the denial without crashing or showing raw error text.

---

## Notifications

- Verify the page heading and the Notify Me button are visible.
- Grant notification permission and click the button; verify a notification is triggered with the expected title and body text.
- Deny notification permission and verify the page handles the denial gracefully.

---

## Get User Media

- Verify the page heading, the Start button, and the video element are all visible.
- Verify no device label is displayed before the Start button is clicked.
- Grant camera permission with a mocked device and click Start; verify the device label appears on the page.
- Verify the Start button becomes disabled after it is clicked.
- Deny camera permission and verify the page handles the denial gracefully.

---

## Multilanguage

- Verify the page heading is visible.
- Verify exactly four list items are shown on the page.
- Load the page with the locale set to English (en-US) and verify the content is displayed in English.
- Load the page with the locale set to Spanish (es-ES) and verify the content changes to Spanish.
- Verify the list items have the correct language class and translation key attributes set.

---

## Console Logs

- Verify the page heading and description text are visible.
- Capture all four types of console output triggered by the page: log, info, warning, and error.
- Verify the exact text of the console log message matches the expected value.
- Verify the exact text of the console info message matches the expected value.
- Verify the exact text of the console warning message matches the expected value.
- Verify the exact text of the console error message matches the expected value.
- Verify the page throws a JavaScript error and capture it as a page error event; confirm its message matches expectations.
- Verify the captured console messages include a source URL pointing to the page.

---

## Index Page — Chapter 5 Links

- Verify all Chapter 5 feature links are visible on the index page.
- Verify clicking each link navigates to the correct page.
