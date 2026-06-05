import {expect} from "@playwright/test";
import {createBdd} from "playwright-bdd";
import {NeosDialogs, NeosInspector} from "../helpers/pages";

const {When, Then} = createBdd();

When(
    "I click the {string} SelectBox in the node creation dialog",
    async ({page}, propertyId: string) => {
        const dialogs = new NeosDialogs(page);
        await dialogs.creationSelectBoxHeader(propertyId).click();
    },
);

When(
    "I click the {string} SelectBox in the inspector",
    async ({page}, propertyId: string) => {
        const inspector = new NeosInspector(page);
        await inspector.selectBoxHeader(propertyId).click();
    },
);

// Inspector scroll positioning. The dropdown's open-direction logic
// (`getCalculatedStyleFromProps` in DropDown/contents.tsx) recomputes whenever
// `document.body` receives a scroll event with capture=true. Scroll events
// from the inspector's tab panel reach that listener via the capture phase,
// so one `scrollBy` is enough to retrigger positioning; the downstream
// `toPass()` retry on the open-direction assertions handles the recalculation
// frame.
//
// The inspector wraps property editors in a `Tabs` component whose styling
// puts both `.tabs__content` and `.panel` at `overflow-y: auto`, so the
// actual scrolling element depends on intrinsic vs. constrained heights at
// runtime. Rather than guessing the right CSS-module hash, we walk up from
// a known descendant and pick whichever ancestor is actually scrollable.

When(
    "I scroll the inspector so the Element with propertyId {string} is at the bottom of the viewport",
    async ({page}, propertyId: string) => {
        const inspector = new NeosInspector(page);
        await inspector.editorWrapper(propertyId).evaluate((propertyEl) => {
            const containerEl = findInspectorScrollContainer(propertyEl);
            const delta = propertyEl.getBoundingClientRect().bottom
                - containerEl.getBoundingClientRect().bottom;
            containerEl.scrollBy(0, delta);

            function findInspectorScrollContainer(start: Element): HTMLElement {
                let current: Element | null = start;
                while (current && current.id !== "neos-Inspector") {
                    const style = getComputedStyle(current);
                    if (
                        (style.overflowY === "auto" || style.overflowY === "scroll")
                        && current.scrollHeight > current.clientHeight
                    ) {
                        return current as HTMLElement;
                    }
                    current = current.parentElement;
                }
                throw new Error("No scrolling ancestor found inside #neos-Inspector");
            }
        });
    },
);

When("I scroll the inspector all the way to the bottom", async ({page}) => {
    await page.locator("#neos-Inspector").evaluate((inspector) => {
        const containerEl = findInspectorScroller(inspector);
        containerEl.scrollBy(0, containerEl.scrollHeight);

        function findInspectorScroller(rootEl: Element): HTMLElement {
            const probe = rootEl.querySelector('label[for^="__neos__editor__property---"]');
            if (!probe) throw new Error("No property editor found inside #neos-Inspector");
            let current: Element | null = probe;
            while (current && current.id !== "neos-Inspector") {
                const style = getComputedStyle(current);
                if (
                    (style.overflowY === "auto" || style.overflowY === "scroll")
                    && current.scrollHeight > current.clientHeight
                ) {
                    return current as HTMLElement;
                }
                current = current.parentElement;
            }
            throw new Error("No scrolling ancestor found inside #neos-Inspector");
        }
    });
});

When("I scroll the inspector all the way to the top", async ({page}) => {
    await page.locator("#neos-Inspector").evaluate((inspector) => {
        const containerEl = findInspectorScroller(inspector);
        containerEl.scrollBy(0, -containerEl.scrollHeight);

        function findInspectorScroller(rootEl: Element): HTMLElement {
            const probe = rootEl.querySelector('label[for^="__neos__editor__property---"]');
            if (!probe) throw new Error("No property editor found inside #neos-Inspector");
            let current: Element | null = probe;
            while (current && current.id !== "neos-Inspector") {
                const style = getComputedStyle(current);
                if (
                    (style.overflowY === "auto" || style.overflowY === "scroll")
                    && current.scrollHeight > current.clientHeight
                ) {
                    return current as HTMLElement;
                }
                current = current.parentElement;
            }
            throw new Error("No scrolling ancestor found inside #neos-Inspector");
        }
    });
});

When(
    "I hover over the {string} property label in the node creation dialog",
    async ({page}, propertyId: string) => {
        const dialogs = new NeosDialogs(page);
        await dialogs.creationPropertyLabel(propertyId).hover();
    },
);

When(
    "I hover over the {string} property label in the inspector",
    async ({page}, propertyId: string) => {
        const inspector = new NeosInspector(page);
        await inspector.propertyLabel(propertyId).hover();
    },
);

Then("the SelectBox options should open below", async ({page}) => {
    const inspector = new NeosInspector(page);
    await expect(async () => {
        const style = await inspector.openSelectBoxInlineStyle();
        expect(style.top).toMatch(/^\d+(\.\d+)?px$/);
        expect(style.bottom).toBe("");
        expect(style.display).not.toBe("none");
    }).toPass();
});

Then("the SelectBox options should open above", async ({page}) => {
    const inspector = new NeosInspector(page);
    await expect(async () => {
        const style = await inspector.openSelectBoxInlineStyle();
        expect(style.bottom).toMatch(/^\d+(\.\d+)?px$/);
        expect(style.top).toBe("");
        expect(style.display).not.toBe("none");
    }).toPass();
});

Then("the SelectBox options should be hidden", async ({page}) => {
    const inspector = new NeosInspector(page);
    await expect(async () => {
        const style = await inspector.openSelectBoxInlineStyle();
        expect(style.display).toBe("none");
    }).toPass();
});
