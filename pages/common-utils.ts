// @ts-ignore
import Utility = require("../support/utility");

class CommonPage {

    private utility: any;

    constructor() {
        this.utility = new Utility();
    }

    async loginAndNavigate(page: {
        waitForEvent: (arg0: string) => any;
        getByRole: (arg0: string, arg1: { name: string; }) => { (): any; new(): any; click: { (): any; new(): any; }; };
    }, userRole: any) {
        const url = this.utility.getBaseUrl();
        const apiUrl = this.utility.getAPIUrl();
        let username: string, password: string;

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

        const [popup] = await Promise.all([
            page.waitForEvent("popup"),
            page.getByRole("button", {name: "Login"}).click()
        ]);

        await popup.waitForLoadState();
        await popup.getByPlaceholder("someone@example.com").fill(username);
        await popup.getByRole("button", {name: "Next"}).click();
        await popup.getByPlaceholder("Password").fill(password);
        await popup.getByRole("button", {name: "Sign in"}).click({force: true});
    }

    async navigateURL(page: {
        waitForEvent?: (arg0: string) => any;
        getByRole?: (arg0: string, arg1: { name: string; }) => {
            (): any;
            new(): any;
            click: { (): any; new(): any; };
        };
        goto?: any;
    }, url: any) {
        await page.goto(url);
    }
}

module.exports = CommonPage;
