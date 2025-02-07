import { test, expect } from "@playwright/test";
import { SamplePage } from "../pages/samplePage";

const baseURL = "https://formy-project.herokuapp.com/";

test.describe("Formy Complete Web Form", () => {
  test("Submit Webform and Validate", async ({ page }, testInfo) => {
    // Add test metadata
    testInfo.annotations.push({ type: "severity", description: "blocker" });
    testInfo.annotations.push({
      type: "feature",
      description: "Form Submission",
    });
    testInfo.annotations.push({
      type: "story",
      description: "User can submit form with all fields",
    });

    const samplePage = new SamplePage();

    await test.step("Navigate to form page", async () => {
      await page.goto(`${baseURL}form`);
    });

    await test.step("Fill form fields", async () => {
      await page.fill(samplePage.firstNameInput, "John");
      await page.fill(samplePage.lastNameInput, "Doe");
      await page.fill(samplePage.jobTitleInput, "QA Engineer");
    });

    await page.click(samplePage.radioButton);
    await page.click(samplePage.checkbox);
    await page.fill(samplePage.datepicker, "01/01/2022");
    await page.click(samplePage.submitButton);
    const successMessage = await page.textContent(samplePage.successMessage);
    expect(successMessage).toContain("The form was successfully submitted!");

    // Add screenshot attachments
    await testInfo.attach("form-screenshot", {
      body: await page.screenshot(),
      contentType: "image/png",
    });
  });
});
