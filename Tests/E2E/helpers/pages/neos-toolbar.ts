import type {Page} from "@playwright/test";
import {contentFrame} from "../content-iframe";

export class NeosToolbar {
    constructor(private readonly page: Page) {
    }

    // ── PublishDropDown ───────────────────────────────────────────────────────
    //
    // The DropDown.Header from react-ui-components renders a `<div role="button"
    // aria-haspopup="true">` rather than an HTML <button>. We anchor on those
    // attributes inside the #neos-PublishDropDown wrapper.

    publishToggle() {
        return this.page.locator(
            '#neos-PublishDropDown [role="button"][aria-haspopup="true"]',
        );
    }

    publish() {
        return this.page.locator("#neos-PublishDropDown-Publish");
    }

    discardAll() {
        return this.page.locator("#neos-PublishDropDown-DiscardAll");
    }

    // ── Main menu drawer ──────────────────────────────────────────────────────

    /** Toggle for the main drawer (PrimaryToolbar). */
    menuToggle() {
        return this.page.locator("#neos-MenuToggler");
    }

    /**
     * Switch-site link inside the main drawer. Each site renders an anchor with
     * a relative href like "/neos/switch/to/neos.test.twodimensions"; we anchor
     * on that path prefix plus the hostname's leading label so the locator does
     * not accidentally match other anchors that happen to contain the hostname
     * (e.g. the "Show preview" link).
     */
    drawerSiteLink(hostname: string) {
        const slug = hostname.split(".")[0];
        return this.page.locator(`a[href^="/neos/switch/to/"][href*="${slug}"]`);
    }

    // ── Inline (in-iframe) toolbar ────────────────────────────────────────────

    /** Inline UI's "Add new" button — rendered inside the content iframe by neos-ui-guest-frame. */
    inlineAddNodeButton() {
        return contentFrame(this.page).locator("#neos-InlineToolbar-AddNode");
    }
}
