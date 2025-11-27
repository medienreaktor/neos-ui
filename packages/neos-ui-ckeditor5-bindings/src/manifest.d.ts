import {GlobalRegistry, SynchronousMetaRegistry, SynchronousRegistry} from '@neos-project/neos-ui-registry';
import {GlobalState} from '@neos-project/neos-ui-redux-store';
import {EditorConfig} from '@ckeditor/ckeditor5-core';

interface CKEditorConfigurationProcessor {
    (ckEditorConfiguration: EditorConfig, options: {editorOptions: any, userPreferences: GlobalState['user']['preferences'], globalRegistry: GlobalRegistry, propertyDomNode: HTMLElement}): EditorConfig
}

interface CKEditorRegistry extends SynchronousMetaRegistry<SynchronousRegistry<unknown>> {
    get(key: 'richtextToolbar'): SynchronousRegistry<{
        component: React.ElementType,
        commandName?: string,
        commandArgs?: any[],
        callbackPropName?: string,
        icon?: string,
        hoverStyle?: string,
        tooltip?: string,
        isVisible: (editorOptions) => boolean,
        isActive?: (formattingUnderCursor) => boolean
    }>;

    get(key: 'config'): SynchronousRegistry<CKEditorConfigurationProcessor>;
}

declare module '@neos-project/neos-ui-registry' {
    interface GlobalRegistry {
        get(key: 'ckEditor5'): CKEditorRegistry;
    }
}
