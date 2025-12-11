import {SynchronousMetaRegistry, SynchronousRegistry} from '@neos-project/neos-ui-registry';
import {RichTextToolbarRegistry} from './registry/RichTextToolbarRegistry';
import {CkEditorConfigRegistry} from './registry/CkEditorConfigRegistry';

interface CKEditorRegistry extends SynchronousMetaRegistry<SynchronousRegistry<unknown>> {
    get(key: 'richtextToolbar'): RichTextToolbarRegistry;

    get(key: 'config'): CkEditorConfigRegistry;
}

declare module '@neos-project/neos-ui-registry' {
    interface GlobalRegistry {
        get(key: 'ckEditor5'): CKEditorRegistry;
    }
}
