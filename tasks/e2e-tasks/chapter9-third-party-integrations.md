# Chapter 9 — Third-Party Integrations

## URLs

- `https://bonigarcia.dev/selenium-webdriver-java/download.html`
- `https://bonigarcia.dev/selenium-webdriver-java/ab-testing.html`
- `https://bonigarcia.dev/selenium-webdriver-java/data-types.html`
- `https://bonigarcia.dev/selenium-webdriver-java/index.html`

## Overview

Test pages that integrate with third-party content or behaviors, including file downloads, A/B testing with randomized content, and a multi-field data entry form with validation feedback.

---

## Download Files

- Verify the page heading is visible.
- Verify four download links are present on the page.
- Verify the first download link (WebDriverManager logo) points to a PNG file.
- Verify the second download link (WebDriverManager documentation) points to a PDF file.
- Verify the third download link (Selenium-Jupiter logo) points to a PNG file.
- Verify the fourth download link (Selenium-Jupiter documentation) points to a PDF file.
- Verify all four download links are styled as buttons.
- Trigger the WebDriverManager PNG download and verify the downloaded file has content (its size is greater than zero bytes).
- Trigger the WebDriverManager PDF download and verify the downloaded file has content.
- Trigger the Selenium-Jupiter PNG download and verify the downloaded file has content.
- Trigger the Selenium-Jupiter PDF download and verify the downloaded file has content.

---

## A/B Testing

- Verify the A/B Testing page heading is visible.
- Verify the page loads with either Variation A or Variation B content — the outcome depends on randomness but one of the two must be shown.
- Verify a paragraph of placeholder text is present within the content area.
- Override the random function to return a value below 0.5 and reload the content; verify Variation A text is displayed.
- Override the random function to return a value above 0.5 and reload the content; verify Variation B text is displayed.
- Verify the content container element has the correct ID and class attributes.
- Verify the text content of Variation A and Variation B are different from each other.

---

## Data Types

- Verify the page heading is visible.
- Verify all ten input fields are present: First name, Last name, Address, Zip code, City, Country, Email, Phone, Job position, and Company.
- Verify each input field has the correct name and type attributes.
- Verify all input fields are empty when the page first loads.
- Fill in all ten fields and submit the form; verify every field shows a success indicator on the results page.
- Verify the submitted values are displayed correctly in the results page output.
- Submit the form without filling in any fields; verify every field shows a danger or N/A indicator.
- Fill in only some of the fields and submit; verify that filled fields show success indicators and empty fields show danger indicators.
- Verify the URL of the results page contains query parameters corresponding to the submitted values.
- Enter a field value containing special characters and submit; verify the special characters are handled correctly and displayed as entered.
- Fill in only the email field and submit; verify the email field shows a success indicator while all other fields show danger indicators.

---

## Index Page — Chapter 9 Links

- Verify all Chapter 9 feature links are visible on the index page.
- Verify clicking each link navigates to the correct page.
