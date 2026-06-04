import type {Page} from "@playwright/test";
import {contentFrame} from "../content-iframe";

export class NeosImageEditor {
    constructor(private readonly page: Page) {
    }

    /**
     * Inspector editor wrapper for the property — anchored on the Label[for=...]
     * and walked up to the wrapping div. Duplicated here (rather than depending
     * on NeosInspector) to keep this class standalone.
     */
    private editorWrapper(propertyId: string) {
        return this.page
            .locator(`label[for="__neos__editor__property---${propertyId}"]`)
            .locator("xpath=ancestor::div[1]");
    }

    /**
     * The crop IconButton inside an image inspector editor — class
     * `cropButton` is set on the IconButton in
     * `Editors/Image/Components/Controls/index.js`.
     */
    cropButton(propertyId: string) {
        return this.editorWrapper(propertyId).locator('[class*="cropButton"]');
    }

    /**
     * The small preview <img> in the property editor's PreviewScreen (class
     * `cropArea__image`). Its inline `top` style is recomputed from the
     * configured crop area, so we use it as the change indicator.
     */
    previewThumbnail(propertyId: string) {
        return this.editorWrapper(propertyId).locator('img[class*="cropArea__image"]');
    }

    /** ReactCrop's outer drag area — the rectangle the user drags to define a crop. */
    reactCropArea() {
        return this.page.locator('.ReactCrop');
    }

    /** Visible content image in the rendered iframe — anchored on a class set in test fixture's Page.fusion. */
    contentImage(className: string) {
        return contentFrame(this.page).locator(`.${className}`);
    }
}
