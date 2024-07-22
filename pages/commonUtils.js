const Utility = require("../support/utility");
const { login } = require("../helpers/auth");

class CommonPage {
  constructor() {
    this.utility = new Utility();
  }

  async loginAndNavigate(page, userRole) {
    const url = this.utility.getBaseUrl();
    const apiUrl = this.utility.getAPIUrl();
    let username, password;

    console.log(`Attempting to log in as: ${userRole}`);

    switch (userRole) {
      case "analyst":
        username = process.env.ANALYST_USERNAME;
        password = process.env.ANALYST_PASSWORD;
        break;
      case "manager":
        username = process.env.MANAGER_USERNAME;
        password = process.env.MANAGER_PASSWORD;
        break;
      case "admin":
        username = process.env.ADMIN_USERNAME;
        password = process.env.ADMIN_PASSWORD;
        break;
      case "Analyst 2":
        username = process.env.LEGALROLE_USERNAME;
        password = process.env.LEGALROLE_PASSWORD;
        break;
      default:
        throw new Error(`Invalid user role: ${userRole}`);
    }

    if (!username || !password) {
      throw new Error(`Username or password is not set for role: ${userRole}`);
    }
    await this.navigateURL(page, url);

    // Wait for the popup to appear when clicking the login button
    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("button", { name: "Login" }).click()
    ]);

    // Ensure the popup is fully loaded
    await popup.waitForLoadState();

    // Interact with the popup to enter username and password
    await popup.getByPlaceholder("someone@example.com").fill(username);
    await popup.getByRole("button", { name: "Next" }).click();
    await popup.getByPlaceholder("Password").fill(password);
    await popup.getByRole("button", { name: "Sign in" }).click({ force: true });
    // await login(page, apiUrl, username, password);
  }

  async navigateURL(page, url) {
    await page.goto(url);
  }
}

module.exports = CommonPage;
