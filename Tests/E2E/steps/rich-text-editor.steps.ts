import {expect} from "@playwright/test";
import {createBdd} from "playwright-bdd";
import {NeosInspector} from "../helpers/pages";
import {contentFrame, setInlineEditorContentOn} from "../helpers/content-iframe";

const {When, Then} = createBdd();

When(
    "I open the inspector CKEditor labelled {string}",
    async ({page}, label: string) => {
        const inspector = new NeosInspector(page);
        await inspector.rteToggleButton(label).click();
    },
);

When(
    "I set the inspector CKEditor content to {string}",
    async ({page}, content: string) => {
        const inspector = new NeosInspector(page);
        // The secondary inspector's CKEditor lives in the main page (it's a
        // React portal into #neos-application), not the content iframe — so
        // we drive the editor instance via the same `data.set` API that
        // setInlineEditorContent uses, but on a main-window locator.
        await setInlineEditorContentOn(
            inspector.secondaryCkEditorEditable(),
            content,
            "paragraph",
        );
    },
);

Then(
    "the rendered {string} content element should contain {string}",
    async ({page}, className: string, expected: string) => {
        await expect(contentFrame(page).locator(`.${className}`)).toContainText(expected);
    },
);
