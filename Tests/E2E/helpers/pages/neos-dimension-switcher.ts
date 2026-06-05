import type {Page} from "@playwright/test";

export class NeosDimensionSwitcher {
    constructor(private readonly page: Page) {
    }

    /**
     * Toolbar toggle that opens the multi-dimension switcher dropdown. The
     * DropDown.Header renders one SelectedPreset span per active dimension —
     * we anchor on the role/aria pair plus that distinctive child class so we
     * don't collide with the PublishDropDown or other toolbar dropdowns.
     */
    toggle() {
        return this.page
            .locator('[role="button"][aria-haspopup="true"]')
            .filter({has: this.page.locator('[class*="selectPreset"]')});
    }

    /**
     * Wrapper <li class="dimensionCategory"> for one dimension inside the open
     * switcher dropdown. We scope by an exact match on the dimension's label
     * (e.g. "Language", "Country") so the language and country sections are
     * unambiguously distinguishable.
     */
    category(dimensionLabel: string) {
        return this.page
            .locator('[class*="dimensionCategory"]')
            .filter({has: this.page.getByText(dimensionLabel, {exact: true})});
    }

    /** Header (click target) of one dimension's SelectBox. */
    selectorHeader(dimensionLabel: string) {
        return this.category(dimensionLabel)
            .locator('[role="button"][aria-haspopup="true"]');
    }

    /**
     * The toolbar dimension SelectBox on a single-dimension site. The
     * DimensionSwitcher renders this case directly (no outer DropDown.Stateless
     * wrapper, no `dimensionCategory` listitem) — just the SelectBox inside a
     * `singleDimensionDropdown` div. Selecting an option here commits
     * immediately; there is no Apply button.
     */
    singleHeader() {
        return this.page.locator(
            '[class*="singleDimensionDropdown"] [role="button"][aria-haspopup="true"]',
        );
    }

    /**
     * Option inside the currently-open dimension SelectBox, matched by exact
     * label. SelectBox's DropDown.Contents uses scrollable={true} which
     * portals the <ul role="listbox"> to document.body, so we cannot scope
     * the option lookup to the dimensionCategory; we anchor on the portaled
     * listbox instead. Only one dimension SelectBox is expected to be open
     * at a time.
     */
    option(optionLabel: string) {
        return this.page
            .locator('body > [role="listbox"][aria-label="dropdown"]')
            .getByText(optionLabel, {exact: true});
    }

    /** Apply button in the dimension switcher — commits transient presets. */
    applyButton() {
        return this.page.locator("#neos-DimensionSwitcher-Apply");
    }
}
