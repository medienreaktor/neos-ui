import {SynchronousMetaRegistry, SynchronousRegistry} from '@neos-project/neos-ui-registry';
import React from 'react';

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

    // get(key: 'config'): SynchronousRegistry<any>;
}

declare module '@neos-project/neos-ui-registry' {
    interface GlobalRegistry {
        get(key: 'ckEditor5'): CKEditorRegistry;
    }
}
