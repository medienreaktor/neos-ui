import {expect, type Page} from "@playwright/test";
import {createBdd} from "playwright-bdd";
import {NeosDialogs, NeosInspector, NeosToolbar, NeosTree} from "../helpers/pages";
import {
    ChangeRequestTracker,
    clearInlineEditorContent,
    contentFrame,
    setInlineEditorContent,
    setInlineEditorContentOn,
} from "../helpers/content-iframe";

const {Given, When, Then} = createBdd();

// AJAX content-change requests are debounced 500 ms by the inline editor.
// The original TestCafe suite waited 1600 ms; keep that to stay clear of race conditions.
const CHANGE_REQUEST_DEBOUNCE_SETTLE_MS = 1600;

// One tracker per worker/page is sufficient — only one scenario runs at a time per worker
// and the route handler is registered on the active page.
const changeRequests = new ChangeRequestTracker();

// ── Page creation flow ────────────────────────────────────────────────────────

When('I click the "add new page" toolbar button', async ({page}) => {
    const tree = new NeosTree(page);
    await tree.pageAddButton().click();
});

When("I select the {string} node type", async ({page}, label: string) => {
    const dialogs = new NeosDialogs(page);
    await dialogs.selectNodeTypeItem(label).click();
});

When("I go back from the node creation dialog", async ({page}) => {
    const dialogs = new NeosDialogs(page);
    await dialogs.nodeCreationBack().click();
});

When("I enter {string} as the new node title", async ({page}, title: string) => {
    const dialogs = new NeosDialogs(page);
    await dialogs.nodeCreationTitleInput().fill(title);
});

When("I confirm the node creation dialog", async ({page}) => {
    const dialogs = new NeosDialogs(page);
    await dialogs.nodeCreationConfirm().click();
});

Then(
    "the rendered page should contain {string} in its navigation",
    async ({page}, text: string) => {
        // The Home page's Fusion template renders an <li> per child page in its navigation.
        await expect(contentFrame(page).locator("li").filter({hasText: text}).first()).toBeVisible();
    },
);

// ── Inline content node creation + CKEditor ──────────────────────────────────

When("I add a(n) {string} node via the content tree", async ({page}, label: string) => {
    const tree = new NeosTree(page);
    const dialogs = new NeosDialogs(page);
    // Open the content tree and explicitly focus the "Content Collection (main)" node —
    // clicking the iframe collection directly is unreliable because the click typically
    // lands on an existing child instead of the collection itself, which leaves
    // `into` mode disabled in the SelectNodeType dialog.
    await tree.contentToggleButton().click();
    await tree.nodeLabel("Content Collection (main)").click();
    await tree.contentAddButton().click();
    // The SelectNodeType dialog renders an InsertModeSelector with the `into` button
    // enabled because the collection accepts content children.
    await dialogs.insertModeIntoInline().click();
    await dialogs.selectNodeTypeItem(label).click();
});

When(
    "I set the last headline's text to {string} as a {string}",
    async ({page}, text: string, textType: string) => {
        // The new headline is appended to the content collection; pick the last one.
        await setInlineEditorContent(
            page,
            '.test-headline:last-child [contenteditable="true"]',
            text,
            textType as "heading1" | "heading2" | "heading3" | "heading4" | "paragraph",
        );
    },
);

When("I clear the last headline's text", async ({page}) => {
    await clearInlineEditorContent(
        page,
        '.test-headline:last-child [contenteditable="true"]',
    );
});

Then(
    "the rendered content collection should contain {string}",
    async ({page}, text: string) => {
        await expect(
            contentFrame(page).locator(".neos-contentcollection").filter({hasText: text}),
        ).toBeVisible();
    },
);

// ── Change-request tracking + validation tooltip ─────────────────────────────

Given("I track content-change requests", async ({page}) => {
    changeRequests.reset();
    await changeRequests.start(page);
});

When("I reset the content-change request counter", () => {
    changeRequests.reset();
});

When("I wait for the change-request debounce to settle", async ({page}) => {
    await page.waitForTimeout(CHANGE_REQUEST_DEBOUNCE_SETTLE_MS);
});

Then("a content-validation tooltip should be visible", async ({page}) => {
    // InlineValidationTooltips lives in neos-ui-guest-frame and renders ITS DOM
    // INSIDE the content iframe (see InlineValidationErrors/index.js). The error
    // text shows up as <ul><li>This property is required.</li></ul> inside a
    // Tooltip-classed wrapper — match the wrapper by its hashed class fragment.
    await expect(
        contentFrame(page).locator('[class*="tooltip--asError"]').first(),
    ).toBeVisible();
});

Then("no content-change request should have been sent", () => {
    expect(changeRequests.value).toBe(0);
});

Then("a content-change request should have been sent", () => {
    expect(changeRequests.value).toBeGreaterThan(0);
});

// ── NodeType help in the SelectNodeType dialog ────────────────────────────────

When("I open the inline content creation dialog", async ({page}) => {
    const tree = new NeosTree(page);
    const toolbar = new NeosToolbar(page);
    const dialogs = new NeosDialogs(page);
    // Focus the content collection via the content tree before invoking the inline
    // toolbar. Clicking ".neos-contentcollection" directly is unreliable because the
    // click typically lands on an existing child (e.g. the demo Headline) instead of
    // the collection itself — that focuses a leaf node and disables `into` mode.
    await tree.contentToggleButton().click();
    await tree.nodeLabel("Content Collection (main)").click();
    await toolbar.inlineAddNodeButton().click();
    await dialogs.insertModeIntoInline().click();
});

When("I click the help icon for the {string} node type", async ({page}, label: string) => {
    await page
        .locator("#neos-SelectNodeTypeDialog")
        .getByTestId(`help-button-for-${label}`)
        .click();
});

Then("the node type help should contain bold text {string}", async ({page}, text: string) => {
    await expect(
        page.locator("#neos-SelectNodeTypeDialog strong").filter({hasText: text}),
    ).toBeVisible();
});

Then("the {string} node type should have no help icon", async ({page}, label: string) => {
    await expect(
        page
            .locator("#neos-SelectNodeTypeDialog")
            .getByTestId(`help-button-for-${label}`)
    ).toHaveCount(0);
});

// ── ClientEval: dependent SelectBox options in the creation dialog ────────────

When(
    "I open the content creation dialog for {string}",
    async ({page}, nodeTypeLabel: string) => {
        const tree = new NeosTree(page);
        const dialogs = new NeosDialogs(page);
        await tree.contentToggleButton().click();
        await tree.nodeLabel("Content Collection (main)").click();
        await tree.contentAddButton().click();
        await dialogs.insertModeIntoInline().click();
        await dialogs.selectNodeTypeItem(nodeTypeLabel).click();
    },
);

// Helpers for creation-dialog SelectBox selectors.
//
// SimpleSelectBoxEditor doesn't forward its `id` prop, so the SelectBox's DropDown.Header
// and DropDown.Contents have no stable id. We anchor instead on:
//   • the editor wrapper (via the Label[for=...] which IS stable)
//   • role="button" + aria-haspopup="true" for the SelectBox header
//   • the open dropdown panel (portaled to <body> by DropDown.Contents) renders as
//     <ul role="listbox" aria-label="dropdown"> — only ONE is open at any time

function creationDialogSelectHeader(page: Page, field: string) {
    const dialogs = new NeosDialogs(page);
    return dialogs.creationEditorWrapper(field).locator('[role="button"][aria-haspopup="true"]').first();
}

function openDropdownOptions(page: Page) {
    return page.locator('ul[role="listbox"][aria-label="dropdown"]');
}

Then(
    "the {string} creation dialog select should offer {string}",
    async ({page}, field: string, option: string) => {
        await creationDialogSelectHeader(page, field).click();
        await expect(openDropdownOptions(page).getByText(option, {exact: true})).toBeVisible();
        await creationDialogSelectHeader(page, field).click();
    },
);

Then(
    "the {string} creation dialog select should not offer {string}",
    async ({page}, field: string, option: string) => {
        await creationDialogSelectHeader(page, field).click();
        await expect(openDropdownOptions(page).getByText(option, {exact: true})).toHaveCount(0);
        await creationDialogSelectHeader(page, field).click();
    },
);

When(
    "I choose {string} in the {string} creation dialog select",
    async ({page}, value: string, field: string) => {
        await creationDialogSelectHeader(page, field).click();
        await openDropdownOptions(page).getByText(value, {exact: true}).click();
    },
);

When("I wait for the creation dialog to recalculate", async ({page}) => {
    // The dependent SelectBox fetches updated options via a data source (AJAX).
    // The TestCafe suite waited 2 s; add a small buffer to stay clear of flakiness.
    await page.waitForTimeout(2500);
});

// ── Image node via content tree ───────────────────────────────────────────────

let imageBaseline = 0;

Given("I count the images in the content frame as the baseline", async ({page}) => {
    imageBaseline = await contentFrame(page).locator(".test-image[src]").count();
});

When("I open the image picker and select the first available media asset", async ({page}) => {
    const inspector = new NeosInspector(page);
    // ImageEditor doesn't forward `id` to the DOM, so anchor via the Label[for=...]
    // and walk up to the editor wrapper. Inside, find the camera-icon IconButton.
    await inspector
        .editorWrapper("image")
        .locator("button:has([data-icon='camera'])")
        .click();
    await page
        .frameLocator('[name="neos-media-selection-screen"]')
        .locator(".asset-list .asset a")
        .first()
        .click();
});

Then("the content frame should contain one more image than the baseline", async ({page}) => {
    await expect(contentFrame(page).locator(".test-image[src]")).toHaveCount(imageBaseline + 1);
});

// ── Inline CKEditor paragraph:false ──────────────────────────────────────────

When(
    "I set the last inline headline's raw content to {string}",
    async ({page}, content: string) => {
        // Pass an empty textType so setInlineEditorContent calls data.set() directly
        // without wrapping in a block-level tag — required for autoparagraph:false nodes.
        await setInlineEditorContent(
            page,
            ".test-inline-headline:last-child [contenteditable='true']",
            content,
            "",
        );
    },
);

// ── Secondary inspector view: image creation dialog + crop ───────────────────

let creationDialogCropLeft = "";

When(
    "I open the creation dialog image picker and select the first available media asset",
    async ({page}) => {
        const dialogs = new NeosDialogs(page);
        await dialogs
            .creationEditorWrapper("image")
            .locator("button:has([data-icon='camera'])")
            .click();
        await page
            .frameLocator('[name="neos-media-selection-screen"]')
            .locator(".asset")
            .first()
            .click();
    },
);

When("I crop the image in the creation dialog", async ({page}) => {
    const dialogs = new NeosDialogs(page);
    const imageEditor = dialogs.creationEditorWrapper("image");
    await imageEditor.locator('button[title="Crop"]').click();

    const cropArea = page.locator(".ReactCrop");
    const box = await cropArea.boundingBox();
    if (!box) throw new Error("ReactCrop element has no bounding box");

    // Click to reset any existing selection, then drag to create a new crop region.
    await page.mouse.click(box.x + 5, box.y + 5);
    await page.mouse.move(box.x + 5, box.y + 5);
    await page.mouse.down();
    await page.mouse.move(box.x + 55, box.y + 55);
    await page.mouse.up();

    creationDialogCropLeft = await imageEditor
        .locator("img")
        .first()
        .evaluate((el) => window.getComputedStyle(el).left);
});

Then(
    "the inspector image should show the same crop as was applied in the creation dialog",
    async ({page}) => {
        const inspector = new NeosInspector(page);
        const inspectorImg = inspector.editorWrapper("image").locator("img").first();
        await expect(inspectorImg).toHaveCSS("left", creationDialogCropLeft);
    },
);

// ── Container + text node ─────────────────────────────────────────────────────

When(
    "I add a(n) {string} node into {string} via the content tree",
    async ({page}, nodeType: string, targetNode: string) => {
        const tree = new NeosTree(page);
        const dialogs = new NeosDialogs(page);
        await tree.nodeLabel(targetNode).click();
        await tree.contentAddButton().click();
        await dialogs.insertModeIntoInline().click();
        await dialogs.selectNodeTypeItem(nodeType).click();
    },
);

Then("the {string} content tree node should be visible", async ({page}, label: string) => {
    const tree = new NeosTree(page);
    // Use partial match — some node types (e.g. Text_Test) compute their tree label
    // from a property value, so the rendered label is "Text_Test {value}" rather than
    // an exact "Text_Test".
    await expect(tree.nodeLabelContaining(label).first()).toBeVisible();
});

Then("the text node should be placed inside the container's inner wrap", async ({page}) => {
    await expect(
        contentFrame(page).locator(".test-container__inner-wrap .test-text"),
    ).toHaveCount(1);
});

When("I set the text node's content to {string}", async ({page}, text: string) => {
    await setInlineEditorContent(
        page,
        ".test-text [contenteditable='true']",
        text,
        "paragraph",
    );
});

Then(
    "the text node in the content frame should contain {string}",
    async ({page}, text: string) => {
        await expect(contentFrame(page).locator(".test-text")).toHaveText(text);
    },
);

When(
    "I copy the {string} content tree node and paste it after",
    async ({page}, nodeLabel: string) => {
        const tree = new NeosTree(page);
        const dialogs = new NeosDialogs(page);
        await tree.nodeLabel(nodeLabel).click();
        await tree.contentCopySelectedButton().click();
        await tree.contentPasteButton().click();
        await dialogs.insertModeAfter().click();
        await dialogs.insertModeApply().click();
    },
);

Then(
    "there should be {int} {string} nodes in the content tree",
    async ({page}, count: number, label: string) => {
        const tree = new NeosTree(page);
        await expect(tree.nodeLabelContaining(label)).toHaveCount(count);
    },
);

When(
    "I set the last container's text node content to {string}",
    async ({page}, text: string) => {
        // Use Locator.last() rather than CSS `:last-child` — Home's content collection
        // also contains the demo Headline, so `:last-child` would only match if the
        // container happened to be the very last DOM child of the parent. Locator.last()
        // gives the last MATCHING element regardless of sibling position.
        const editable = contentFrame(page)
            .locator(".test-container")
            .last()
            .locator(".test-text [contenteditable='true']");
        await setInlineEditorContentOn(editable, text, "paragraph");
    },
);

Then(
    "the last container's text node should contain {string}",
    async ({page}, text: string) => {
        await expect(
            contentFrame(page).locator(".test-container").last().locator(".test-text"),
        ).toHaveText(text);
    },
);

Then(
    "the first container's text node should contain {string}",
    async ({page}, text: string) => {
        await expect(
            contentFrame(page).locator(".test-container").first().locator(".test-text"),
        ).toHaveText(text);
    },
);
