# Chapter 8 — Testing Framework Specifics

## URLs

- `https://bonigarcia.dev/selenium-webdriver-java/random-calculator.html`
- `https://bonigarcia.dev/selenium-webdriver-java/index.html`

## Overview

Test a random calculator that intentionally produces incorrect results at a configurable error rate and corrects itself after a set number of retries. This section exercises framework-level features like flaky test handling and retry logic.

---

## Random Calculator

- Verify the page heading and description text are visible.
- Verify the error percentage input field is present and defaults to 50.
- Verify the correct-after input field is present and defaults to 5.
- Verify the loading spinner is hidden when the page first loads.
- Verify the calculator widget is visible and the display area is empty on load.
- Verify digit buttons for 0 through 9 are all present on the calculator.
- Verify the four operator buttons are present: addition, subtraction, division, and multiplication.
- Verify the Clear button is present and styled in red.
- Verify the Equals button is present and styled as a warning (yellow/orange).
- Verify the decimal point button is present.
- Click the digit buttons 1, 2, and 3 in sequence and verify the display shows 123.
- Click the Clear button and verify the display resets to empty.
- Click a digit followed by an operator and verify both appear on the display.
- Verify that pressing an operator button as the very first input has no effect (except for the minus sign).
- Verify that pressing the decimal point after a digit adds a decimal point to the number.
- Verify that a second decimal point cannot be entered into the same number.
- Verify that pressing a different operator while an operator is already on screen replaces the first operator.
- Set the error rate to zero, enter an addition expression, press Equals, and verify the result is mathematically correct.
- Set the error rate to zero and verify that subtraction, multiplication, and division also produce correct results.
- Set the error rate to 100, perform a calculation, and verify the result is intentionally wrong.
- Change the error percentage input to a new value and verify the calculator's behavior changes accordingly.
- Set the correct-after value to a specific number and verify that after that many retries the calculator produces the correct result.
- Enter a multi-digit calculation with the error rate set to zero and verify the correct result is shown.

---

## Index Page — Chapter 8 Links

- Verify the Chapter 8 section heading is visible on the index page.
- Verify the Random Calculator link is present.
- Click the Random Calculator link, verify the page heading is correct, then navigate back and verify the index page is restored.
