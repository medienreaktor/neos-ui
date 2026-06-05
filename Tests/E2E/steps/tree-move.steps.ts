import {expect} from "@playwright/test";
import {createBdd} from "playwright-bdd";
import {NeosDialogs, NeosTree} from "../helpers/pages";

const {When, Then} = createBdd();

// ── When: selecting tree nodes ────────────────────────────────────────────────

When("I select the {string} tree node", async ({page}, name: string) => {
    const tree = new NeosTree(page);
    await tree.pageNodeLabel(name).click();
});

When("I also select the {string} tree node via ctrl-click", async ({page}, name: string) => {
    const tree = new NeosTree(page);
    // Use ControlOrMeta so the test works on both Linux (Control) and macOS (Meta).
    // The Tree's multi-select handler accepts metaKey || ctrlKey (see Node/index.js).
    await tree.pageNodeLabel(name).click({modifiers: ["ControlOrMeta"]});
});

When("I also select the {string} tree node via shift-click", async ({page}, name: string) => {
    const tree = new NeosTree(page);
    await tree.pageNodeLabel(name).click({modifiers: ["Shift"]});
});

// ── When: clipboard / drag-drop actions ───────────────────────────────────────

When("I cut the selected tree nodes", async ({page}) => {
    const tree = new NeosTree(page);
    await tree.pageCutSelectedButton().click();
});

When("I paste the clipboard into the selected tree node", async ({page}) => {
    const tree = new NeosTree(page);
    const dialogs = new NeosDialogs(page);
    await tree.pagePasteButton().click();
    // The InsertModeSelector dialog asks where to paste — choose "into" and apply.
    await dialogs.insertModeInto().click();
    await dialogs.insertModeApply().click();
});

When(
    "I drag the {string} tree node onto the {string} tree node",
    async ({page}, source: string, target: string) => {
        const tree = new NeosTree(page);
        // The content tree is open by default in Neos 9.1. Navigating to a node (step 1)
        // makes it appear in both trees, activating a second DnD context that intercepts
        // drop events meant for the page tree. Close it so only the page tree is live.
        await tree.ensureContentTreeClosed();
        await tree.pageNodeLabel(source).dragTo(tree.pageNodeLabel(target));
    },
);

// ── Then: structural relationship in the tree ─────────────────────────────────

Then(
    "the {string} tree node should be nested under {string}",
    async ({page}, child: string, parent: string) => {
        const tree = new NeosTree(page);
        // The child's label must be visible inside the parent's outer treeitem container.
        // (substring match via filter is safe here since "MultiA" doesn't contain "MultiB" etc.)
        const childLabelInsideParent = tree
            .pageNodeContainer(parent)
            .locator('a[data-neos-integrational-test="tree__item__nodeHeader__itemLabel"]')
            .filter({hasText: child});
        await expect(childLabelInsideParent).toHaveCount(1);
    },
);

Then("no error flash message should be visible", async ({page}) => {
    await expect(page.locator('[role="alert"][class*="error"]')).toHaveCount(0);
});

Then("no error screen should be visible in the content iframe", async ({page}) => {
    await expect(
        page.frameLocator('[name="neos-content-main"]').locator(".neos-error-screen"),
    ).toHaveCount(0);
});
