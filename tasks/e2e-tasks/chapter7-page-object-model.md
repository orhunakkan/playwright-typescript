# Chapter 7 — The Page Object Model

## URLs

- `https://bonigarcia.dev/selenium-webdriver-java/login-form.html`
- `https://bonigarcia.dev/selenium-webdriver-java/login-slow.html`
- `https://bonigarcia.dev/selenium-webdriver-java/index.html`

## Overview

Test login form behavior using the Page Object Model pattern. Covers a standard login form and a slow login form that introduces a deliberate delay with a loading spinner.

---

## Login Form

- Verify the login form heading is visible on the page.
- Verify the username input field is present and has the correct ID, type, and name attributes.
- Verify the password input field is present and has the correct ID, type, name, and autocomplete attributes.
- Verify the submit button is present on the form.
- Verify both the username and password fields are empty when the page first loads.
- Verify that typing in the username field captures and displays the typed value.
- Verify that typing in the password field captures and displays the typed value.
- Verify the invalid credentials alert message is hidden when the page first loads.
- Log in with the correct username and password and verify the success alert appears with the appropriate styling.
- Log in with a wrong username and verify the invalid credentials alert becomes visible.
- Log in with a wrong password and verify the invalid credentials alert becomes visible.
- Submit the form with both fields left empty and verify the invalid credentials alert becomes visible.
- Verify the form element has the correct action and method attributes.
- Submit the form by pressing the Enter key rather than clicking the button and verify the result.
- After a successful login, verify the resulting page URL includes the expected query parameters.
- Tab through the form fields and verify keyboard focus moves between them in the correct order.

---

## Slow Login Form

- Verify the slow login form heading is visible on the page.
- Verify the username and password input fields are present.
- Verify the submit button is present.
- Verify the loading spinner element is hidden when the page first loads.
- Click the submit button and verify the loading spinner becomes visible while the form is processing.
- Log in with the correct credentials and wait for the delay to complete; verify the success page is shown.
- Log in with incorrect credentials and wait for the delay; verify the invalid credentials alert appears.
- Verify the loading spinner disappears after the delay completes, regardless of whether login succeeded or failed.
- Verify the success page displays the correct heading.
- After a successful slow login, verify the resulting URL includes the expected query parameters.

---

## Index Page — Chapter 7 Links

- Verify all Chapter 7 feature links are visible on the index page.
- Verify clicking each link navigates to the correct page.
