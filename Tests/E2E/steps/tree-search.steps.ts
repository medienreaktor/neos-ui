import {expect} from "@playwright/test";
import {createBdd} from "playwright-bdd";
import {NeosTree} from "../helpers/pages";

const {When, Then} = createBdd();

// ── When ──────────────────────────────────────────────────────────────────────

When("I open the document tree search", async ({page}) => {
    const tree = new NeosTree(page);
    await tree.searchToggle().click();
    // Sidebar UI state is debounced 100ms before being persisted to localStorage
    // (see localStorageMiddleware.js). Wait so the toggled state survives a subsequent
    // page reload — used by the "preserved across reloads" scenario.
    await page.waitForTimeout(150);
});

When("I search the document tree for {string}", async ({page}, query: string) => {
    const tree = new NeosTree(page);
    await tree.searchInput().fill(query);
});

When("I filter the document tree by {string}", async ({page}, optionLabel: string) => {
    const tree = new NeosTree(page);
    await tree.filter().click();
    // The SelectBox renders its options inside a context dropdown panel. Clicking by
    // visible text targets the option (and matches the original TestCafe approach
    // of clicking the <li> with the given label).
    await page
        .locator(`[role="button"][aria-haspopup="listbox"] ~ * li, [role="listbox"] li`)
        .getByText(optionLabel, {exact: true})
        .first()
        .click();
});

When("I clear the document tree search", async ({page}) => {
    const tree = new NeosTree(page);
    await tree.searchClearButton().click();
});

When("I clear the document tree filter", async ({page}) => {
    // SelectBox_Header renders the reset button with id `{selectBoxId}-btn-reset`
    // when allowEmpty=true and a value is selected.
    // See packages/react-ui-components/src/SelectBox_Header/selectBox_Header.js.
    await page.locator("#neos-NodeTreeFilter-SelectBox-btn-reset").click();
});

// ── Then ──────────────────────────────────────────────────────────────────────

Then(
    "the document tree should contain {int} node(s) named {string}",
    async ({page}, expected: number, name: string) => {
        const tree = new NeosTree(page);
        await expect(tree.nodeLabel(name)).toHaveCount(expected);
    },
);

Then("the document tree should contain a node named {string}", async ({page}, name: string) => {
    const tree = new NeosTree(page);
    await expect(tree.nodeLabel(name).first()).toBeVisible();
});

Then("the document tree should not contain a node named {string}", async ({page}, name: string) => {
    const tree = new NeosTree(page);
    await expect(tree.nodeLabel(name)).toHaveCount(0);
});

Then("the document tree search field should be visible", async ({page}) => {
    const tree = new NeosTree(page);
    await expect(tree.searchWrapper()).toBeVisible();
});

Then("the document tree search field should be hidden", async ({page}) => {
    const tree = new NeosTree(page);
    await expect(tree.searchWrapper()).toHaveCount(0);
});
