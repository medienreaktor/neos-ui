import type {FrameLocator, Locator, Page} from "@playwright/test";

/**
 * FrameLocator for the Neos content iframe (named `neos-content-main`).
 * The iframe hosts the rendered page plus the InlineUI toolbar/validation overlays
 * provided by `@neos-project/neos-ui-guest-frame`.
 */
export function contentFrame(page: Page): FrameLocator {
    return page.frameLocator('[name="neos-content-main"]');
}

const headingTagMap: Record<string, string> = {
    paragraph: "p",
    heading1: "h1",
    heading2: "h2",
    heading3: "h3",
    heading4: "h4",
};

/**
 * Set the content of an inline CKEditor instance by calling its `data.set()` API
 * directly. Mirrors the original utils.js helper from the TestCafe suite.
 *
 * Why direct API instead of typing? CKEditor's input handling inside an iframe
 * is too unreliable for character-by-character typing. The editor instance is
 * attached to the closest `.ck-editor__editable` ancestor by CKEditor at startup.
 *
 * `selector` is resolved INSIDE the content iframe.
 */
export async function setInlineEditorContent(
    page: Page,
    selector: string,
    text: string,
    textType: keyof typeof headingTagMap | "" = "",
): Promise<void> {
    const tagName = textType ? headingTagMap[textType] : "";
    await contentFrame(page)
        .locator(selector)
        .evaluate(
            (el, args) => {
                const editor = (el as HTMLElement).closest(".ck-editor__editable") as HTMLElement & {
                    ckeditorInstance?: { data: { set: (html: string) => void } };
                };
                if (!editor || !editor.ckeditorInstance) {
                    throw new Error("No CKEditor instance attached to ancestor of selector");
                }
                const content = args.tagName ? `<${args.tagName}>${args.text}</${args.tagName}>` : args.text;
                editor.ckeditorInstance.data.set(content);
            },
            {text, tagName},
        );
}

/**
 * Locator-based variant of `setInlineEditorContent` — useful when the target needs to be
 * scoped via Playwright's locator API (e.g. `.locator('.test-container').last()`),
 * which CSS selectors like `:nth-of-class` cannot express.
 */
export async function setInlineEditorContentOn(
    target: Locator,
    text: string,
    textType: keyof typeof headingTagMap | "" = "",
): Promise<void> {
    const tagName = textType ? headingTagMap[textType] : "";
    await target.evaluate(
        (el, args) => {
            const editor = (el as HTMLElement).closest(".ck-editor__editable") as HTMLElement & {
                ckeditorInstance?: { data: { set: (html: string) => void } };
            };
            if (!editor || !editor.ckeditorInstance) {
                throw new Error("No CKEditor instance attached to ancestor");
            }
            const content = args.tagName ? `<${args.tagName}>${args.text}</${args.tagName}>` : args.text;
            editor.ckeditorInstance.data.set(content);
        },
        {text, tagName},
    );
}

/** Clear an inline CKEditor instance via the same data.set() API. */
export async function clearInlineEditorContent(page: Page, selector: string): Promise<void> {
    await contentFrame(page)
        .locator(selector)
        .evaluate((el) => {
            const editor = (el as HTMLElement).closest(".ck-editor__editable") as HTMLElement & {
                ckeditorInstance?: { data: { set: (html: string) => void } };
            };
            if (!editor || !editor.ckeditorInstance) {
                throw new Error("No CKEditor instance attached to ancestor of selector");
            }
            editor.ckeditorInstance.data.set("");
        });
}

/**
 * Tracks how many POST requests to `/neos/ui-services/change` have been issued
 * since `start()` was called. Replaces the TestCafe RequestLogger pattern.
 *
 * Use one tracker per scenario — instantiate via the BDD step that sets it up.
 */
export class ChangeRequestTracker {
    private count = 0;

    get value(): number {
        return this.count;
    }

    async start(page: Page): Promise<void> {
        await page.route("**/neos/ui-services/change", async (route) => {
            if (route.request().method() === "POST") {
                this.count++;
            }
            await route.continue();
        });
    }

    reset(): void {
        this.count = 0;
    }
}
