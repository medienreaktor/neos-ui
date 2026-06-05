import type {Page} from "@playwright/test";

export class NeosTree {
    constructor(private readonly page: Page) {
    }

    refreshButton() {
        return this.page.locator("#neos-PageTree-RefreshPageTree");
    }

    /**
     * Tree node label by exact text. Matches nodes in BOTH the page tree and the content tree.
     * Use pageNodeLabel() when navigating document nodes to avoid strict-mode violations
     * when the content tree is open (the current document appears in both trees with the
     * same label but different id prefixes: "treeitem-*" vs "content-treeitem-*").
     */
    nodeLabel(name: string) {
        return this.page
            .locator('a[data-neos-integrational-test="tree__item__nodeHeader__itemLabel"]')
            .getByText(name, {exact: true});
    }

    /**
     * Page (document) tree node label scoped to the page tree only.
     * Page tree nodes use id="treeitem-*"; content tree nodes use id="content-treeitem-*".
     * Avoids strict-mode violations when the content tree is open and shows the current
     * document node alongside the same node in the page tree.
     */
    pageNodeLabel(name: string) {
        return this.page
            .locator('a[data-neos-integrational-test="tree__item__nodeHeader__itemLabel"][id^="treeitem-"]')
            .getByText(name, {exact: true});
    }

    /**
     * Ensures the content tree panel is open without toggling blindly.
     * In Neos 9.1 the content tree defaults to open, so a blind toggle click closes it.
     * This checks the button icon state first: chevron-circle-up means closed, click to open.
     */
    async ensureContentTreeOpen() {
        const closedIcon = this.page.locator(
            '#neos-ContentTree-ToggleContentTree svg[data-icon="chevron-circle-up"]',
        );
        if (await closedIcon.count() > 0) {
            await this.contentToggleButton().click();
            await this.page
                .locator('a[data-neos-integrational-test="tree__item__nodeHeader__itemLabel"][id^="content-treeitem-"]')
                .first()
                .waitFor();
        }
    }

    /**
     * Ensures the content tree panel is closed before page-tree drag operations.
     * In Neos 9.1 the content tree is open by default. Navigating to a node causes it
     * to appear in both trees; the active content-tree DnD context can intercept or
     * confuse drop events intended for the page tree. Closing it removes that interference.
     */
    async ensureContentTreeClosed() {
        const contentTreeItems = this.page.locator(
            'a[data-neos-integrational-test="tree__item__nodeHeader__itemLabel"][id^="content-treeitem-"]',
        );
        if (await contentTreeItems.count() > 0) {
            await this.contentToggleButton().click();
            await contentTreeItems.first().waitFor({state: "hidden"});
        }
    }

    /**
     * The OUTER container <div role="treeitem"> for a tree node, identified by the unique
     * label inside it. The inner label <a> also carries role="treeitem"; we restrict to <div>
     * so we get the parent container that holds both the header and any nested children.
     *
     * See packages/react-ui-components/src/Tree/node.js — the outer <div role="treeitem">
     * wraps the header (with the label <a>) and the nested children container.
     */
    nodeContainer(name: string) {
        return this.nodeLabel(name).locator(
            'xpath=ancestor::div[@role="treeitem"][1]',
        );
    }

    /** Same as nodeContainer() but scoped to the page tree (id^="treeitem-"). */
    pageNodeContainer(name: string) {
        return this.pageNodeLabel(name).locator(
            'xpath=ancestor::div[@role="treeitem"][1]',
        );
    }

    /** Tree node label by partial text (substring match). */
    nodeLabelContaining(name: string) {
        return this.page
            .locator('a[data-neos-integrational-test="tree__item__nodeHeader__itemLabel"]')
            .filter({hasText: name});
    }

    // ── Search / filter ───────────────────────────────────────────────────────

    searchToggle() {
        return this.page.locator("#btn-ToggleDocumentTreeFilter");
    }

    searchWrapper() {
        return this.page.locator("#neos-NodeTreeSearchInput");
    }

    searchInput() {
        return this.page.locator('#neos-NodeTreeSearchInput input[type="search"]');
    }

    searchClearButton() {
        return this.page.locator("#neos-NodeTreeSearchInput-btn-reset");
    }

    filter() {
        return this.page.locator("#neos-NodeTreeFilter-SelectBox");
    }

    // ── Page tree operations ──────────────────────────────────────────────────

    pageAddButton() {
        return this.page.locator("#neos-PageTree-AddNode");
    }

    pageCutSelectedButton() {
        return this.page.locator("#neos-PageTree-CutSelectedNode");
    }

    pagePasteButton() {
        return this.page.locator("#neos-PageTree-PasteClipBoardNode");
    }

    pageDeleteSelectedButton() {
        return this.page.locator("#neos-PageTree-DeleteSelectedNode");
    }

    // ── Content tree operations ───────────────────────────────────────────────

    contentToggleButton() {
        return this.page.locator("#neos-ContentTree-ToggleContentTree");
    }

    contentAddButton() {
        return this.page.locator("#neos-ContentTree-AddNode");
    }

    contentCopySelectedButton() {
        return this.page.locator("#neos-ContentTree-CopySelectedNode");
    }

    contentPasteButton() {
        return this.page.locator("#neos-ContentTree-PasteClipBoardNode");
    }

    contentDeleteSelectedButton() {
        return this.page.locator("#neos-ContentTree-DeleteSelectedNode");
    }
}
