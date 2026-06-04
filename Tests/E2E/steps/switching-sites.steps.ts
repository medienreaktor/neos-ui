import {expect} from "@playwright/test";
import {createBdd} from "playwright-bdd";
import {NeosLoginPage, NeosToolbar} from "../helpers/pages";

const {When, Then} = createBdd();

// Logging in via a specific hostname is what binds the resulting session to a
// site — the regular login step uses the Playwright baseURL ("localhost") and
// always lands on the default site. For switching-sites scenarios we need to
// start on a known site, so we go directly to <host>:8081/neos/login.
When(
    "I log in to {string} with username {string} and password {string}",
    async ({page}, host: string, username: string, password: string) => {
        await page.goto(`http://${host}:8081/neos/login`);
        const loginPage = new NeosLoginPage(page);
        await loginPage.login(username, password);
        await page.waitForLoadState("networkidle");
    },
);

When("I switch to the site at {string} via the main menu", async ({page}, host: string) => {
    const toolbar = new NeosToolbar(page);
    await toolbar.menuToggle().click();
    await toolbar.drawerSiteLink(host).click();
    await page.waitForURL(new RegExp(`^https?://${host.replace(/\./g, "\\.")}`));
    await page.waitForLoadState("networkidle");
});

Then("the current URL host should be {string}", async ({page}, host: string) => {
    expect(new URL(page.url()).hostname).toBe(host);
});
