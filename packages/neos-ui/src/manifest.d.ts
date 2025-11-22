import {SynchronousMetaRegistry, SynchronousRegistry} from '@neos-project/neos-ui-registry';
import React from 'react';

declare module '@neos-project/neos-ui-registry' {
    interface GlobalRegistry {
        get(key: 'containers'): SynchronousRegistry<React.ComponentType>;
        get(key: 'inspector'): SynchronousMetaRegistry<SynchronousRegistry<{component: React.ElementType, hasOwnLabel?: boolean}>>;
    }
}
