import {IEditor} from '@neos-project/neos-ui-link-editor-core';

import {GlobalRegistry} from '@neos-project/neos-ui-registry';
import {createLinkUiPlugin} from './LinkUiPlugin';

export function registerInlineLinkEditor(
    globalRegistry: GlobalRegistry,
    editor: IEditor
): void {
    const ckeditor5Registry = globalRegistry.get('ckEditor5');
    if (!ckeditor5Registry) {
        console.warn('[Neos.Neos.Ui:LinkEditor]: Could not find ckeditor5 registry.');
        console.warn('[Neos.Neos.Ui:LinkEditor]: Skipping registration of RTE formatter...');
        return;
    }

    const configRegistry = ckeditor5Registry.get('config');
    if (!configRegistry) {
        console.warn('[Neos.Neos.Ui:LinkEditor]: Could not find ckeditor5 config registry.');
        console.warn('[Neos.Neos.Ui:LinkEditor]: Skipping registration of RTE formatter...');
        return;
    }

    configRegistry.set('link', (ckEditorConfiguration, {editorOptions}) => ({
        ...ckEditorConfiguration,
        plugins: [
            ...(ckEditorConfiguration.plugins ?? []),
            ...(editorOptions?.formatting?.a ? [createLinkUiPlugin(editor, editorOptions)] : [])
        ]
    }));
}
