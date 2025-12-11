import {GlobalRegistry, SynchronousRegistry} from '@neos-project/neos-ui-registry';
import {EditorConfig} from '@ckeditor/ckeditor5-core';
import {GlobalState} from '@neos-project/neos-ui-redux-store';

export interface CKEditorConfigurationProcessorOptions {
    editorOptions: any
    userPreferences: GlobalState['user']['preferences']
    globalRegistry: GlobalRegistry
    propertyDomNode: HTMLElement
}

export interface CKEditorConfigurationProcessor {
    (ckEditorConfiguration: EditorConfig, options: CKEditorConfigurationProcessorOptions): EditorConfig
}

export class CkEditorConfigRegistry extends SynchronousRegistry<CKEditorConfigurationProcessor> {
    getCkeditorConfig(options: CKEditorConfigurationProcessorOptions): EditorConfig {
        return this._registry.map(i => i.value).reduce((acc, value) => value(acc, options), {});
    }
}
