import type {Page} from "@playwright/test";

type SideBarSide = "left" | "right";

export class NeosSidebar {
    constructor(private readonly page: Page) {
    }

    /**
     * Locator for a sidebar's outermost rendered element (the one carrying aria-hidden).
     *  - left sidebar: <SideBar position="left"> renders a div whose CSS class contains "sideBar--left"
     *  - right sidebar: rendered with role="form"
     */
    container(side: SideBarSide) {
        if (side === "left") {
            return this.page.locator('[class*="sideBar--left"][aria-hidden]');
        }
        return this.page.locator('[role="form"][aria-hidden]');
    }

    /**
     * Click target that toggles the sidebar visibility.
     *  - left: the IconButton (#neos-LeftSideBarToggler) inside the toggle header.
     *    When the sidebar is collapsed, only this IconButton stays visible; clicks
     *    bubble up to the header div which carries the onClick handler.
     *  - right: the toggle button (#neos-ToggleInspector) sits inside the sidebar itself.
     */
    toggler(side: SideBarSide) {
        if (side === "left") {
            return this.page.locator("#neos-LeftSideBarToggler");
        }
        return this.page.locator("#neos-ToggleInspector");
    }
}
