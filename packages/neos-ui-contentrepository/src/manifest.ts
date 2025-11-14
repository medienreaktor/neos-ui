import manifest from '@neos-project/neos-ui-extensibility';

import type {NodeTypesRegistry} from './registry';
import {nodeTypesRegistry} from './registry';

manifest('@neos-project/neos-ui-contentrepository', {}, globalRegistry => {
    globalRegistry.set(
        '@neos-project/neos-ui-contentrepository',
        nodeTypesRegistry
    );
});

declare module '@neos-project/neos-ui-registry' {
    interface GlobalRegistry {
        get(key: '@neos-project/neos-ui-contentrepository'): NodeTypesRegistry;
    }
}
