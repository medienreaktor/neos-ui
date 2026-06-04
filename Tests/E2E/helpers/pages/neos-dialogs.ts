import type {Page} from "@playwright/test";

export class NeosDialogs {
    constructor(private readonly page: Page) {
    }

    // ── Unapplied changes overlay/dialog ──────────────────────────────────────
    //
    // Tightly coupled to inspector dirty state but rendered as a portaled
    // overlay/dialog. When the inspector has dirty fields and is not currently
    // prompting, the Inspector container portals a div with
    // `unappliedChangesOverlay` class to `document.body`. Clicking it opens
    // the UnappliedChangesDialog.

    unappliedOverlay() {
        return this.page.locator('[class*="unappliedChangesOverlay"]');
    }

    unapplied() {
        return this.page.locator("#neos-UnappliedChangesDialog");
    }

    unappliedResume() {
        return this.page.locator("#neos-UnappliedChangesDialog-resume");
    }

    unappliedDiscard() {
        return this.page.locator("#neos-UnappliedChangesDialog-discard");
    }

    // ── Discard dialog (from publish dropdown) ────────────────────────────────

    discardConfirm() {
        return this.page.locator("#neos-DiscardDialog-Confirm");
    }

    discardAcknowledge() {
        return this.page.locator("#neos-DiscardDialog-Acknowledge");
    }

    // ── Delete-node confirmation ──────────────────────────────────────────────

    /** Delete-node confirmation modal — id="neos-DeleteNodeModal-Confirm". */
    deleteNodeConfirm() {
        return this.page.locator("#neos-DeleteNodeModal-Confirm");
    }

    // ── Insert-mode (after paste / drop) ──────────────────────────────────────
    //
    // The dialog is committed via #neos-InsertModeModal-apply.

    insertModeInto() {
        return this.page.locator("#into");
    }

    insertModeAfter() {
        return this.page.locator("#after");
    }

    insertModeBefore() {
        return this.page.locator("#before");
    }

    insertModeApply() {
        return this.page.locator("#neos-InsertModeModal-apply");
    }

    /** The "Insert mode" dialog has plain id="into" / id="before" / id="after" buttons. */
    insertModeIntoInline() {
        return this.page.locator("button#into");
    }

    // ── Node creation flow ────────────────────────────────────────────────────

    /**
     * Pick a NodeType from the SelectNodeType dialog by visible label.
     * The dialog is identified by id "neos-SelectNodeTypeDialog"; node-type items render
     * a button containing the localized label text.
     */
    selectNodeTypeItem(label: string) {
        return this.page
            .locator("#neos-SelectNodeTypeDialog button")
            .filter({ hasText: new RegExp(`^${label}$`) })
            .first();
    }

    nodeCreationTitleInput() {
        return this.page.locator("#neos-NodeCreationDialog-Body input").first();
    }

    nodeCreationConfirm() {
        return this.page.locator("#neos-NodeCreationDialog-CreateNew");
    }

    nodeCreationBack() {
        return this.page.locator("#neos-NodeCreationDialog-Back");
    }

    /**
     * Editor wrapper inside the NodeCreationDialog — anchored on the
     * Label[for="__neos__editor__property---X--creation-dialog"] suffix.
     */
    creationEditorWrapper(propertyId: string) {
        return this.page
            .locator(`label[for="__neos__editor__property---${propertyId}--creation-dialog"]`)
            .locator("xpath=ancestor::div[1]");
    }

    /** Label DOM element for a creation-dialog property — usable as a hover target to scroll the dialog. */
    creationPropertyLabel(propertyId: string) {
        return this.page.locator(
            `label[for="__neos__editor__property---${propertyId}--creation-dialog"]`,
        );
    }

    /** Header (clickable trigger) of the SelectBox inside the open NodeCreationDialog, by property id. */
    creationSelectBoxHeader(propertyId: string) {
        return this.creationEditorWrapper(propertyId)
            .locator('[role="button"][aria-haspopup="true"]');
    }

    // ── Variant creation ──────────────────────────────────────────────────────

    /** "Create Empty" button on the NodeVariantCreationDialog. */
    nodeVariantCreateEmpty() {
        return this.page.locator("#neos-NodeVariantCreationDialog-CreateEmpty");
    }
}
