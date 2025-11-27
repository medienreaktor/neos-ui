
import {Plugin} from '@ckeditor/ckeditor5-core';
import {isLinkElement, LinkCommand, LinkEditing, UnlinkCommand, _LINK_KEYSTROKE as LINK_KEYSTROKE} from '@ckeditor/ckeditor5-link';
import {
    ButtonView,
    ContextualBalloon,
    ToolbarView,
    ButtonExecuteEvent
} from '@ckeditor/ckeditor5-ui';
import {isWidget} from '@ckeditor/ckeditor5-widget';
import {IconLink, IconPencil, IconUnlink} from '@ckeditor/ckeditor5-icons';
import {
    ClickObserver,
    ViewAttributeElement,
    ViewDocumentClickEvent,
    ViewElement,
    ViewPosition
} from '@ckeditor/ckeditor5-engine';
import {DomOptimalPositionOptions} from '@ckeditor/ckeditor5-utils';
import {IEditor, ILinkOptions} from '@neos-project/neos-ui-link-editor-core';
/** @ts-expect-error */
import {LinkTargetBlankPlugin} from './LinkTargetBlankPlugin';
/** @ts-expect-error */
import {LinkRelNofollowPlugin} from './LinkRelNofollowPlugin';
/** @ts-expect-error */
import {LinkDownloadPlugin} from './LinkDownloadPlugin';
/** @ts-expect-error */
import {LinkTitlePlugin} from './LinkTitlePlugin';

const VISUAL_SELECTION_MARKER_NAME = 'neos-link-ui';

interface NeosEditorOptions {
    linking?: {
        title?: boolean
        relNofollow?: boolean
        targetBlank?: boolean
        download?: boolean
        // legacy root level option, linkTypes.Node.startingPoint should be used instead
        startingPoint?: string
        linkTypes?: {
            [key: string]: object
        }
    }
}

export function createLinkUiPlugin(neosLinkEditor: IEditor, neosEditorOptions: NeosEditorOptions) {
    /**
     * The link UI plugin. It introduces the `'link'` and `'unlink'` buttons and support for the <kbd>Ctrl+K</kbd> keystroke.
     *
     * Adjusted from https://github.com/ckeditor/ckeditor5/blob/v47.2.0/packages/ckeditor5-link/src/linkui.ts
     */
    return class LinkUiPlugin extends Plugin {
        /**
         * The toolbar view displayed inside of the balloon.
         */
        public toolbarView: ToolbarView | null = null;

        private _balloon!: ContextualBalloon;

        public static get requires() {
            return [ContextualBalloon, LinkEditing, LinkTargetBlankPlugin, LinkRelNofollowPlugin, LinkDownloadPlugin, LinkTitlePlugin];
        }

        public static get pluginName() {
            return 'LinkUi';
        }

        public init(): void {
            const {editor} = this;

            editor.editing.view.addObserver(ClickObserver);

            this._balloon = editor.plugins.get(ContextualBalloon);

            this._registerComponents();
            this._enableBalloonActivators();

            // Renders a fake visual selection marker on an expanded selection.
            editor.conversion.for('editingDowncast').markerToHighlight({
                model: VISUAL_SELECTION_MARKER_NAME,
                view: {
                    classes: ['ck-fake-link-selection']
                }
            });

            // Renders a fake visual selection marker on a collapsed selection.
            editor.conversion.for('editingDowncast').markerToElement({
                model: VISUAL_SELECTION_MARKER_NAME,
                view: (data, {writer}) => {
                    if (!data.markerRange.isCollapsed) {
                        return null;
                    }

                    const markerElement = writer.createUIElement('span');

                    writer.addClass(
                        ['ck-fake-link-selection', 'ck-fake-link-selection_collapsed'],
                        markerElement
                    );

                    return markerElement;
                }
            });
        }

        public override destroy(): void {
            super.destroy();

            if (this.toolbarView) {
                this.toolbarView.destroy();
            }
        }

        private async _handleLinkEditing() {
            const editorOptions = {
                linkTypes: {
                    ...neosEditorOptions?.linking?.linkTypes
                }
            };

            if (neosEditorOptions?.linking?.startingPoint) {
                // handle legacy root level option
                editorOptions.linkTypes.Node = {
                    ...editorOptions.linkTypes.Node,
                    startingPoint:
                        (editorOptions.linkTypes.Node as any).startingPoint
                        ?? neosEditorOptions.linking.startingPoint
                };
            }

            const linkCommand: LinkCommand = this.editor.commands.get('link')!;

            const link = linkCommand.value ? {
                href: linkCommand.value,
                options: {
                    title: this.editor.commands.get('linkTitle')?.value as string | undefined,
                    targetBlank: Boolean(this.editor.commands.get('linkTargetBlank')?.value),
                    relNofollow: Boolean(this.editor.commands.get('linkRelNofollow')?.value),
                    download: Boolean(this.editor.commands.get('linkDownload')?.value)
                }
            } : null;

            const enabledLinkOptions: (keyof ILinkOptions)[] = [];

            if (neosEditorOptions?.linking?.title) {
                enabledLinkOptions.push('title');
            }

            if (neosEditorOptions?.linking?.relNofollow) {
                enabledLinkOptions.push('relNofollow');
            }

            if (neosEditorOptions?.linking?.targetBlank) {
                enabledLinkOptions.push('targetBlank');
            }

            if (neosEditorOptions?.linking?.download) {
                enabledLinkOptions.push('download');
            }

            const result = await neosLinkEditor.transactions.editLink(link, enabledLinkOptions, editorOptions);

            if (result.change) {
                if (result.value === null) {
                    this.editor.execute('linkTitle', false);
                    this.editor.execute('linkRelNofollow', false);
                    this.editor.execute('linkTargetBlank', false);
                    this.editor.execute('linkDownload', false);
                    this.editor.execute('unlink');
                    this.editor.focus();
                } else {
                    this.editor.execute('linkTitle', result.value.options?.title || false);
                    this.editor.execute('linkRelNofollow', result.value.options?.relNofollow ?? false);
                    this.editor.execute('linkTargetBlank', result.value.options?.targetBlank ?? false);
                    this.editor.execute('linkDownload', result.value.options?.download ?? false);

                    this.editor.execute('link', result.value.href);
                    this.editor.focus();
                }
            } else {
                this.editor.focus();
            }
        }

        private _createViews() {
            this.toolbarView = this._createToolbarView();

            // Attach lifecycle actions to the the balloon.
            this._enableUserBalloonInteractions();
        }

        private _createToolbarView(): ToolbarView {
            const {editor} = this;
            const toolbarView = new ToolbarView(editor.locale);

            toolbarView.class = 'ck-link-toolbar';

            const {t} = editor.locale;

            const linkCommand: LinkCommand = editor.commands.get('link')!;
            const editButton = new ButtonView(editor.locale);
            editButton.set({
                label: t('Edit link'),
                icon: IconPencil,
                tooltip: true
            });
            editButton.bind('isEnabled').to(linkCommand);
            this.listenTo<ButtonExecuteEvent>(editButton, 'execute', () => {
                this._handleLinkEditing();
            });
            toolbarView.items.add(editButton);

            const unlinkCommand: UnlinkCommand = editor.commands.get('unlink')!;
            const unlinkButton = new ButtonView(editor.locale);
            unlinkButton.set({
                label: t('Unlink'),
                icon: IconUnlink,
                tooltip: true
            });
            unlinkButton.bind('isEnabled').to(unlinkCommand);
            this.listenTo<ButtonExecuteEvent>(unlinkButton, 'execute', () => {
                editor.execute('unlink');
                this._hideUI();
            });
            toolbarView.items.add(unlinkButton);

            // Close the panel on esc key press when the **link toolbar have focus**.
            toolbarView.keystrokes.set('Esc', (data, cancel) => {
                this._hideUI();
                cancel();
            });

            // Open the form view on Ctrl+K when the **link toolbar have focus**..
            toolbarView.keystrokes.set(LINK_KEYSTROKE, (data, cancel) => {
                this._handleLinkEditing();

                cancel();
            });

            // Register the toolbar, so it becomes available for Alt+F10 and Esc navigation.
            // This should be registered earlier to be able to open this toolbar without previously opening it by click or Ctrl+K
            editor.ui.addToolbar(toolbarView, {
                isContextual: true,
                beforeFocus: () => {
                    if (this._getSelectedLinkElement() && !this._isToolbarVisible) {
                        this._showUI(true);
                    }
                },
                afterBlur: () => {
                    this._hideUI(false);
                }
            });

            return toolbarView;
        }

        /**
         * Registers components in the ComponentFactory.
         */
        private _registerComponents(): void {
            const {editor} = this;

            editor.ui.componentFactory.add('link', () => {
                const button = this._createButton(ButtonView);

                button.set({
                    tooltip: true
                });

                return button;
            });
        }

        /**
         * Creates a button for link command to use either in toolbar or in menu bar.
         */
        private _createButton<T extends typeof ButtonView>(ButtonClass: T): InstanceType<T> {
            const {editor} = this;
            const {locale} = editor;
            const command = editor.commands.get('link')!;
            const view = new ButtonClass(editor.locale) as InstanceType<T>;
            const {t} = locale;

            view.set({
                label: t('Link'),
                icon: IconLink,
                keystroke: LINK_KEYSTROKE,
                isToggleable: true
            });

            view.bind('isEnabled').to(command, 'isEnabled');
            view.bind('isOn').to(command, 'value', value => Boolean(value));

            // Show the panel on button click.
            this.listenTo<ButtonExecuteEvent>(view, 'execute', () => {
                editor.editing.view.scrollToTheSelection();
                this._showUI(true);

                // Open the form view on-top of the toolbar view if it's already visible.
                // It should be visible every time the link is selected.
                if (this._getSelectedLinkElement()) {
                    this._handleLinkEditing();
                }
            });

            return view;
        }

        /**
         * Attaches actions that control whether the balloon panel containing the
         * {@link #formView} should be displayed.
         */
        private _enableBalloonActivators(): void {
            const {editor} = this;
            const viewDocument = editor.editing.view.document;

            // Handle click on view document and show panel when selection is placed inside the link element.
            // Keep panel open until selection will be inside the same link element.
            this.listenTo<ViewDocumentClickEvent>(viewDocument, 'click', () => {
                const parentLink = this._getSelectedLinkElement();

                if (parentLink) {
                    // Then show panel but keep focus inside editor editable.
                    this._showUI();
                }
            });

            // Handle the `Ctrl+K` keystroke and show the panel.
            editor.keystrokes.set(LINK_KEYSTROKE, (keyEvtData, cancel) => {
                // Prevent focusing the search bar in FF, Chrome and Edge. See https://github.com/ckeditor/ckeditor5/issues/4811.
                cancel();

                if (editor.commands.get('link')!.isEnabled) {
                    editor.editing.view.scrollToTheSelection();
                    this._showUI(true);
                }
            });
        }

        /**
         * Attaches actions that control whether the balloon panel containing the
         * {@link #formView} is visible or not.
         */
        private _enableUserBalloonInteractions(): void {
            // Focus the form if the balloon is visible and the Tab key has been pressed.
            this.editor.keystrokes.set('Tab', (data, cancel) => {
                if (this._isToolbarVisible && !this.toolbarView!.focusTracker.isFocused) {
                    this.toolbarView!.focus();
                    cancel();
                }
            }, {
                // Use the high priority because the link UI navigation is more important
                // than other feature's actions, e.g. list indentation.
                // https://github.com/ckeditor/ckeditor5-link/issues/146
                priority: 'high'
            });

            // Close the panel on the Esc key press when the editable has focus and the balloon is visible.
            this.editor.keystrokes.set('Esc', (data, cancel) => {
                if (this._isUIVisible) {
                    this._hideUI();
                    cancel();
                }
            });
        }

        /**
         * Adds the {@link #toolbarView} to the {@link #_balloon}.
         *
         * @internal
         */
        public _addToolbarView(): void {
            if (!this.toolbarView) {
                this._createViews();
            }

            if (this._isToolbarInPanel) {
                return;
            }

            this._balloon.add({
                view: this.toolbarView!,
                position: this._getBalloonPositionData(),
                balloonClassName: 'ck-toolbar-container'
            });
        }

        /**
         * Shows the correct UI type. It is either {@link #formView} or {@link #toolbarView}.
         *
         * @internal
         */
        public _showUI(forceVisible: boolean = false): void {
            if (!this.toolbarView) {
                this._createViews();
            }

            // When there's no link under the selection, go straight to the editing UI.
            if (!this._getSelectedLinkElement()) {
                // Show visual selection on a text without a link when the contextual balloon is displayed.
                // See https://github.com/ckeditor/ckeditor5/issues/4721.
                this._showFakeVisualSelection();

                this._addToolbarView();

                // Be sure panel with link is visible.
                if (forceVisible) {
                    this._balloon.showStack('main');
                }

                this._handleLinkEditing();
            } else {
                // If there's a link under the selection...
                // Go to the editing UI if toolbar is already visible.
                if (this._isToolbarVisible) {
                    this._handleLinkEditing();
                } else {
                    // Otherwise display just the toolbar.
                    this._addToolbarView();
                }

                // Be sure panel with link is visible.
                if (forceVisible) {
                    this._balloon.showStack('main');
                }
            }

            // Begin responding to ui#update once the UI is added.
            this._startUpdatingUI();
        }

        /**
         * Removes the {@link #formView} from the {@link #_balloon}.
         *
         * See {@link #_addFormView}, {@link #_addToolbarView}.
         */
        private _hideUI(updateFocus: boolean = true): void {
            const {editor} = this;

            if (!this._isUIInPanel) {
                return;
            }

            this.stopListening(editor.ui, 'update');
            this.stopListening(this._balloon, 'change:visibleView');

            // Make sure the focus always gets back to the editable _before_ removing the focused form view.
            // Doing otherwise causes issues in some browsers. See https://github.com/ckeditor/ckeditor5-link/issues/193.
            if (updateFocus) {
                editor.editing.view.focus();
            }

            // Finally, remove the link toolbar view because it's last in the stack.
            if (this._isToolbarInPanel) {
                this._balloon.remove(this.toolbarView!);
            }

            this._hideFakeVisualSelection();
        }

        /**
         * Makes the UI reposition itself when the editor UI should be refreshed.
         *
         * See: {@link #_hideUI} to learn when the UI stops reacting to the `update` event.
         */
        private _startUpdatingUI(): void {
            const {editor} = this;
            const viewDocument = editor.editing.view.document;

            let prevSelectedLink = this._getSelectedLinkElement();
            let prevSelectionParent = getSelectionParent();

            const update = () => {
                const selectedLink = this._getSelectedLinkElement();
                const selectionParent = getSelectionParent();

                // Hide the panel if:
                //
                // * the selection went out of the EXISTING link element. E.g. user moved the caret out
                //   of the link,
                // * the selection went to a different parent when creating a NEW link. E.g. someone
                //   else modified the document.
                // * the selection has expanded (e.g. displaying link toolbar then pressing SHIFT+Right arrow).
                //
                // Note: #_getSelectedLinkElement will return a link for a non-collapsed selection only
                // when fully selected.
                if ((prevSelectedLink && !selectedLink) ||
                    (!prevSelectedLink && selectionParent !== prevSelectionParent)) {
                    this._hideUI();
                } else if (this._isUIVisible) {
                    // Update the position of the panel when:
                    //  * link panel is in the visible stack
                    //  * the selection remains in the original link element,
                    //  * there was no link element in the first place, i.e. creating a new link

                    // If still in a link element, simply update the position of the balloon.
                    // If there was no link (e.g. inserting one), the balloon must be moved
                    // to the new position in the editing view (a new native DOM range).
                    this._balloon.updatePosition(this._getBalloonPositionData());
                }

                prevSelectedLink = selectedLink;
                prevSelectionParent = selectionParent;
            };

            function getSelectionParent() {
                return viewDocument.selection.focus!.getAncestors()
                    .reverse()
                    .find((node): node is ViewElement => node.is('element'));
            }

            this.listenTo(editor.ui, 'update', update);
            this.listenTo(this._balloon, 'change:visibleView', update);
        }

        private get _isToolbarInPanel(): boolean {
            return Boolean(this.toolbarView) && this._balloon.hasView(this.toolbarView);
        }

        private get _isToolbarVisible(): boolean {
            return Boolean(this.toolbarView) && this._balloon.visibleView === this.toolbarView;
        }

        private get _isUIInPanel(): boolean {
            return this._isToolbarInPanel;
        }

        private get _isUIVisible(): boolean {
            return this._isToolbarVisible;
        }

        /**
         * Returns positioning options for the {@link #_balloon}. They control the way the balloon is attached
         * to the target element or selection.
         *
         * If the selection is collapsed and inside a link element, the panel will be attached to the
         * entire link element. Otherwise, it will be attached to the selection.
         */
        private _getBalloonPositionData(): Partial<DomOptimalPositionOptions> {
            const {view} = this.editor.editing;
            const viewDocument = view.document;
            const {model} = this.editor;

            if (model.markers.has(VISUAL_SELECTION_MARKER_NAME)) {
                // There are cases when we highlight selection using a marker (#7705, #4721).
                const markerViewElements = this.editor.editing.mapper.markerNameToElements(VISUAL_SELECTION_MARKER_NAME);

                // Marker could be removed by link text override and end up in the graveyard.
                if (markerViewElements) {
                    const markerViewElementsArray = Array.from(markerViewElements);
                    const newRange = view.createRange(
                        view.createPositionBefore(markerViewElementsArray[0]),
                        view.createPositionAfter(markerViewElementsArray[markerViewElementsArray.length - 1])
                    );

                    return {
                        target: view.domConverter.viewRangeToDom(newRange)
                    };
                }
            }

            // Make sure the target is calculated on demand at the last moment because a cached DOM range
            // (which is very fragile) can desynchronize with the state of the editing view if there was
            // any rendering done in the meantime. This can happen, for instance, when an inline widget
            // gets unlinked.
            return {
                target: () => {
                    const targetLink = this._getSelectedLinkElement();

                    return targetLink ?
                        // When selection is inside link element, then attach panel to this element.
                        view.domConverter.mapViewToDom(targetLink)! :
                        // Otherwise attach panel to the selection.
                        view.domConverter.viewRangeToDom(viewDocument.selection.getFirstRange()!);
                }
            };
        }

        /**
         * Returns the link ViewAttributeElement under
         * the ViewAttributeElement editing view's selection or `null`
         * if there is none.
         *
         * **Note**: For a non–collapsed selection, the link element is returned when **fully**
         * selected and the **only** element within the selection boundaries, or when
         * a linked widget is selected.
         */
        private _getSelectedLinkElement(): ViewAttributeElement | null {
            const {view} = this.editor.editing;
            const {selection} = view.document;
            const selectedElement = selection.getSelectedElement();

            // The selection is collapsed or some widget is selected (especially inline widget).
            if (selection.isCollapsed || selectedElement && isWidget(selectedElement)) {
                return findLinkElementAncestor(selection.getFirstPosition()!);
            }
            // The range for fully selected link is usually anchored in adjacent text nodes.
            // Trim it to get closer to the actual link element.
            const range = selection.getFirstRange()!.getTrimmed();
            const startLink = findLinkElementAncestor(range.start);
            const endLink = findLinkElementAncestor(range.end);

            if (!startLink || startLink != endLink) {
                return null;
            }

            // Check if the link element is fully selected.
            if (view.createRangeIn(startLink).getTrimmed().isEqual(range)) {
                return startLink;
            }
            return null;
        }

        /**
         * Displays a fake visual selection when the contextual balloon is displayed.
         *
         * This adds a 'link-ui' marker into the document that is rendered as a highlight on selected text fragment.
         */
        private _showFakeVisualSelection(): void {
            const {model} = this.editor;

            model.change(writer => {
                const range = model.document.selection.getFirstRange()!;

                if (model.markers.has(VISUAL_SELECTION_MARKER_NAME)) {
                    writer.updateMarker(VISUAL_SELECTION_MARKER_NAME, {range});
                } else if (range.start.isAtEnd) {
                    const startPosition = range.start.getLastMatchingPosition(
                            ({item}) => !model.schema.isContent(item),
                            {boundaries: range}
                        );

                    writer.addMarker(VISUAL_SELECTION_MARKER_NAME, {
                        usingOperation: false,
                        affectsData: false,
                        range: writer.createRange(startPosition, range.end)
                    });
                } else {
                    writer.addMarker(VISUAL_SELECTION_MARKER_NAME, {
                        usingOperation: false,
                        affectsData: false,
                        range
                    });
                }
            });
        }

        /**
         * Hides the fake visual selection created in {@link #_showFakeVisualSelection}.
         */
        private _hideFakeVisualSelection(): void {
            const {model} = this.editor;

            if (model.markers.has(VISUAL_SELECTION_MARKER_NAME)) {
                model.change(writer => {
                    writer.removeMarker(VISUAL_SELECTION_MARKER_NAME);
                });
            }
        }
    }
}

/**
 * Returns a link element if there's one among the ancestors of the provided `Position`.
 *
 * @param View position to analyze.
 * @returns Link element at the position or null.
 */
function findLinkElementAncestor(position: ViewPosition): ViewAttributeElement | null {
    return position.getAncestors().find((ancestor): ancestor is ViewAttributeElement => isLinkElement(ancestor)) || null;
}
