import {expect, type Page} from "@playwright/test";
import {createBdd} from "playwright-bdd";
import {NeosDialogs, NeosInspector, NeosTree} from "../helpers/pages";

const {When, Then} = createBdd();

// ── When ──────────────────────────────────────────────────────────────────────

When("I refresh the document tree", async ({page}) => {
    const tree = new NeosTree(page);
    await tree.refreshButton().click();
});

When("I set the inspector {string} field to {string}", async ({page}, propertyName: string, value: string) => {
    const inspector = new NeosInspector(page);
    await inspector.field(propertyName).fill(value);
});

When("I clear the inspector {string} field", async ({page}, propertyName: string) => {
    const inspector = new NeosInspector(page);
    await inspector.field(propertyName).fill("");
});

When("I apply the inspector changes", async ({page}) => {
    const inspector = new NeosInspector(page);
    await inspector.applyButton().click();
});

When("I discard the inspector changes", async ({page}) => {
    const inspector = new NeosInspector(page);
    await inspector.discardButton().click();
});

When(
    "I append {string} to the inspector {string} field",
    async ({page}, text: string, propertyName: string) => {
        const inspector = new NeosInspector(page);
        const field = inspector.field(propertyName);
        await field.focus();
        await field.press("End");
        await field.pressSequentially(text);
    },
);

When("I sync the URL path segment from the title", async ({page}) => {
    const inspector = new NeosInspector(page);
    // The URI sync reads options.title which the inspector resolves from the
    // ClientEval expression `node.properties.title` against transient state.
    // The inspector runs that resolution on a 250ms debounce (leading=true,
    // so the first edit fires immediately, but rapid edits are coalesced).
    // Mirror the 200ms wait the original testcafe suite used so we click
    // sync only after the resolved title has settled.
    await page.waitForTimeout(300);
    await inspector.uriPathSegmentSyncButton().click();
});

When("I click outside the inspector to trigger the unapplied-changes overlay", async ({page}) => {
    const dialogs = new NeosDialogs(page);
    await dialogs.unappliedOverlay().click();
});

When("I resume editing in the unapplied-changes dialog", async ({page}) => {
    const dialogs = new NeosDialogs(page);
    await dialogs.unappliedResume().click();
});

When("I discard the inspector changes from the unapplied-changes dialog", async ({page}) => {
    const dialogs = new NeosDialogs(page);
    await dialogs.unappliedDiscard().click();
});

Then("the unapplied-changes dialog should be visible", async ({page}) => {
    const dialogs = new NeosDialogs(page);
    await expect(dialogs.unapplied()).toBeVisible();
});

Then("the unapplied-changes dialog should not be visible", async ({page}) => {
    const dialogs = new NeosDialogs(page);
    await expect(dialogs.unapplied()).toHaveCount(0);
});

// ── Then ──────────────────────────────────────────────────────────────────────

Then("the inspector {string} field should show {string}", async ({page}, propertyName: string, expected: string) => {
    const inspector = new NeosInspector(page);
    await expect(inspector.field(propertyName)).toHaveValue(expected);
});

Then("the active inspector tab should show {int} validation error(s)", async ({page}, expected: number) => {
    const inspector = new NeosInspector(page);
    await expect(inspector.activeTabBadge()).toHaveText(String(expected));
});

Then("the active inspector tab should show no validation errors", async ({page}) => {
    const inspector = new NeosInspector(page);
    await expect(inspector.activeTabBadge()).toHaveCount(0);
});

// ── ClientEval: dependent SelectBox options in the inspector ─────────────────
//
// Mirrors the "creation dialog" variant in create-new-nodes.steps.ts but
// targets the inspector's SelectBoxes after the node has been created. The
// portaled <ul role="listbox"> is the same DropDown.Contents implementation;
// only one is open at any given time.

function inspectorSelectHeader(page: Page, field: string) {
    const inspector = new NeosInspector(page);
    return inspector.selectBoxHeader(field).first();
}

function openDropdownOptions(page: Page) {
    return page.locator('ul[role="listbox"][aria-label="dropdown"]');
}

Then(
    "the inspector {string} select should offer {string}",
    async ({page}, field: string, option: string) => {
        await inspectorSelectHeader(page, field).click();
        await expect(openDropdownOptions(page).getByText(option, {exact: true})).toBeVisible();
        await inspectorSelectHeader(page, field).click();
    },
);

Then(
    "the inspector {string} select should not offer {string}",
    async ({page}, field: string, option: string) => {
        await inspectorSelectHeader(page, field).click();
        await expect(openDropdownOptions(page).getByText(option, {exact: true})).toHaveCount(0);
        await inspectorSelectHeader(page, field).click();
    },
);

When(
    "I choose {string} in the inspector {string} select",
    async ({page}, value: string, field: string) => {
        await inspectorSelectHeader(page, field).click();
        await openDropdownOptions(page).getByText(value, {exact: true}).click();
    },
);

When("I wait for the inspector to recalculate", async ({page}) => {
    // The dependent SelectBox fetches updated options via a data source (AJAX).
    // The original TestCafe test waited 2 s — we add a small buffer to stay
    // clear of flakiness, mirroring the creation-dialog variant.
    await page.waitForTimeout(2500);
});
