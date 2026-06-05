import type {Page} from "@playwright/test";

export class NeosInspector {
    constructor(private readonly page: Page) {
    }

    /**
     * Inspector property field by NodeType property name.
     * Renders as e.g. <input id="__neos__editor__property---title" />.
     */
    field(propertyName: string) {
        return this.page.locator(`#__neos__editor__property---${propertyName}`);
    }

    applyButton() {
        return this.page.locator("#neos-Inspector-Apply");
    }

    discardButton() {
        return this.page.locator("#neos-Inspector-Discard");
    }

    /** "Sync from title" button next to the URI path segment property. */
    uriPathSegmentSyncButton() {
        return this.page.locator("#neos-UriPathSegmentEditor-sync");
    }

    /**
     * Badge rendered inside the currently active inspector tab when validation errors are present.
     * The Badge component renders <div class="...badge..."> wrapping its label.
     */
    activeTabBadge() {
        return this.page.locator('[role="tab"][aria-selected="true"] [class*="badge"]');
    }

    // ── Editor wrappers (anchor via the Label's htmlFor) ──────────────────────
    //
    // EditorEnvelope renders a Fragment with <Label htmlFor="__neos__editor__property---X">
    // followed by the editor component. The ID is forwarded via `id` prop, but only some
    // editors (TextInput) actually put it on the DOM — SelectBox and ImageEditor drop it.
    //
    // The wrapping div is added by the parent (NodeCreationDialog or InspectorEditorEnvelope).
    // We anchor on the stable Label[for=...] and walk up to that wrapping div, which gives
    // us a scope for finding buttons / select boxes belonging to that property.

    editorWrapper(propertyId: string) {
        return this.page
            .locator(`label[for="__neos__editor__property---${propertyId}"]`)
            .locator("xpath=ancestor::div[1]");
    }

    /** Label DOM element for an inspector property — usable as a hover target to scroll the inspector. */
    propertyLabel(propertyId: string) {
        return this.page.locator(
            `label[for="__neos__editor__property---${propertyId}"]`,
        );
    }

    /** Header of the SelectBox inside the inspector, by property id. */
    selectBoxHeader(propertyId: string) {
        return this.editorWrapper(propertyId)
            .locator('[role="button"][aria-haspopup="true"]');
    }

    /**
     * The "Toggle the editor" Button rendered by the inspector CKEditor
     * component (Neos.Neos/Inspector/Editors/RichTextEditor maps to CKEditor).
     * Clicking opens the secondary inspector with a full CKEditor instance.
     *
     * The CKEditor inspector editor sets `hasOwnLabel: true`, so EditorEnvelope
     * renders no `label[for="__neos__editor__property---<id>"]` we can scope by;
     * the editor's outer div carries no unique identifier either. We anchor on
     * the property's configured label text, which the editor renders verbatim
     * inside the toggle button via `<I18n id={label}/>` (no translation needed
     * for unknown keys — they fall back to the literal).
     */
    rteToggleButton(label: string) {
        return this.page.getByRole("button", {name: label});
    }

    /** SecondaryInspector wrapper portal (class `secondaryInspector` in CSS-module form). */
    secondary() {
        return this.page.locator('[class*="secondaryInspector"]');
    }

    /**
     * The CKEditor editable area rendered inside the secondary inspector's
     * CKEditorWrap. CKEditor decorates the host div with `.ck-content` /
     * `.ck-editor__editable` at runtime.
     */
    secondaryCkEditorEditable() {
        return this.secondary().locator(".ck-content");
    }

    // ── SelectBox positioning ────────────────────────────────────────────────
    //
    // SelectBox renders the open option list via ReactDOM.createPortal to
    // document.body (DropDown.Contents with scrollable={true}). The portal <ul>
    // receives inline styles computed in `getCalculatedStyleFromProps` —
    // `top` when the dropdown opens below, `bottom` when it opens above, and
    // `display: none` when the SelectBox header is scrolled out of the
    // user's view.
    //
    // We assert against those inline styles (what the implementation
    // *decides*) rather than computed pixel positions (what the layout
    // *resolves to*). That keeps the tests independent of viewport, scroll
    // offset, and CSS-module class renames.

    /**
     * The portaled SelectBox option list (a direct child of <body> per
     * DropDown.Contents with scrollable={true}). Returns inline styles that
     * the positioning logic sets — callers assert which property is present.
     */
    async openSelectBoxInlineStyle(): Promise<{ top: string; bottom: string; display: string }> {
        return this.page
            .locator('body > [role="listbox"][aria-label="dropdown"]')
            .evaluate((el: HTMLElement) => ({
                top: el.style.top,
                bottom: el.style.bottom,
                display: el.style.display,
            }));
    }
}
