import type {Page} from "@playwright/test";

export class NeosTree {
    constructor(private readonly page: Page) {
    }

    refreshButton() {
        return this.page.locator("#neos-PageTree-RefreshPageTree");
    }

    /**
     * Tree node label by exact text. The tree__item__nodeHeader__itemLabel attribute is rendered
     * by the react-ui-components Tree component on the <a> wrapping the label.
     */
    nodeLabel(name: string) {
        return this.page
            .locator('a[data-neos-integrational-test="tree__item__nodeHeader__itemLabel"]')
            .getByText(name, {exact: true});
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
