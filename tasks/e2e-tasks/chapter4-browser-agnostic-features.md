# Chapter 4 — Browser-Agnostic Features

## URLs

- `https://bonigarcia.dev/selenium-webdriver-java/long-page.html`
- `https://bonigarcia.dev/selenium-webdriver-java/infinite-scroll.html`
- `https://bonigarcia.dev/selenium-webdriver-java/shadow-dom.html`
- `https://bonigarcia.dev/selenium-webdriver-java/cookies.html`
- `https://bonigarcia.dev/selenium-webdriver-java/frames.html`
- `https://bonigarcia.dev/selenium-webdriver-java/iframes.html`
- `https://bonigarcia.dev/selenium-webdriver-java/dialog-boxes.html`
- `https://bonigarcia.dev/selenium-webdriver-java/web-storage.html`
- `https://bonigarcia.dev/selenium-webdriver-java/index.html`

## Overview

Test browser features that work consistently across all browsers, including scrolling behavior, dynamic content loading, shadow DOM, cookies, frames, iframes, dialog boxes, and web storage.

---

## Long Page

- Verify the page heading is visible when the page loads.
- Verify the page contains at least 20 paragraphs of content.
- Scroll to the bottom of the page and verify the footer becomes visible.
- Scroll to a specific paragraph by its position in the list and verify it is within the visible area.
- Scroll down to the bottom, then scroll back to the top, and verify the heading is visible again.
- Press the End key on the keyboard and verify the page scrolls to the bottom.
- Verify the scroll position value changes after scrolling down from the top.

---

## Infinite Scroll

- Verify the heading is visible and initial content is loaded when the page opens.
- Scroll to the bottom and verify new content is appended to the list.
- Verify the page height increases after scrolling to trigger a new content load.
- Scroll to the bottom multiple times and verify additional content loads each time.
- After several scrolls, verify the total number of loaded items is at least 40.

---

## Shadow DOM

- Verify the page heading is visible.
- Verify the text content inside the shadow DOM is accessible and matches the expected value.
- Verify the shadow root is in open mode.
- Verify exactly one paragraph exists inside the shadow DOM.

---

## Cookies

- Verify the cookies heading and the display button are visible.
- Verify clicking the display button shows the current cookies on the page.
- Read the cookies via the browser context and verify the expected cookie names and values are present.
- Add a new cookie via the browser context and verify it appears both in the context and on the page after refreshing the display.
- Delete a specific cookie via the browser context and verify it no longer appears in the cookie list.
- Clear all cookies and verify none remain.
- Verify the properties of a cookie, such as its path and domain, match the expected values.
- Modify the value of an existing cookie and verify the updated value is reflected.

---

## Frames (Frameset)

- Verify the frameset page loads and contains at least four frames.
- Access the header frame and verify it contains the expected heading text.
- Access the body frame and verify it contains at least 10 paragraphs of lorem ipsum content.
- Access the footer frame and verify it contains a copyright notice.
- Verify each frame loads from its expected HTML source file.

---

## IFrames

- Verify the page heading is visible.
- Verify the iframe element is present on the page with the correct source URL.
- Access the iframe content and verify it contains at least 10 paragraphs.
- Verify the text of the first and last paragraphs inside the iframe matches expectations.
- Verify the iframe has the expected width and height dimensions.
- Access the iframe using the alternative frame access method and verify its content is reachable.
- Verify the content of the main page is distinct from the content inside the iframe.

---

## Dialog Boxes

- Verify all dialog trigger buttons are visible on the page.
- Click the alert button, accept the dialog, and verify the result message on the page updates correctly.
- Click the confirm button, accept the dialog, and verify the result message reflects the accepted choice.
- Click the confirm button, dismiss the dialog, and verify the result message reflects the dismissed choice.
- Click the prompt button, type custom text into the prompt, and verify the entered text appears in the result message.
- Click the prompt button, dismiss the dialog without entering text, and verify the result shows no input was given.
- Click the prompt button, leave the input empty, and submit; verify the result reflects empty input.
- Open the Bootstrap modal and verify its title and body content are visible.
- Close the modal using the Close button and verify it disappears from the page.
- Close the modal using the Save Changes button and verify it disappears.
- Close the modal by pressing the Escape key and verify it disappears.
- Verify the prompt dialog displays a default pre-filled value before the user types.

---

## Web Storage

- Verify the page heading and storage interaction buttons are visible.
- Click the session storage display button and verify the stored values appear on the page.
- Read session storage values by running JavaScript on the page and verify they match expectations.
- Set a new item in session storage and verify it can be read back correctly.
- Remove a session storage item and verify it no longer exists.
- Clear all session storage and verify no items remain.
- Set a new item in local storage and verify it can be read back correctly.
- Remove a local storage item and verify it no longer exists.
- Clear all local storage and verify no items remain.
- Verify that session storage and local storage hold separate, independent values.
- Get the number of items in session storage and verify it matches the count of items that were set.

---

## Index Page — Chapter 4 Links

- Verify all Chapter 4 feature links are visible on the index page.
- Verify clicking each link navigates to the correct page.
