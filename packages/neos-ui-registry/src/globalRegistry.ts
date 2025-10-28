import {SynchronousMetaRegistry, SynchronousRegistry} from './registry';

export interface GlobalRegistry extends SynchronousMetaRegistry<SynchronousRegistry<unknown>> {
}

/**
 * Access to the global registry.
 *
 * FIXME
 * Note that we often pass the global registry around instead and inject it via the react context -> this should be simplified in favour of this global state.
 */
const globalRegistry = new SynchronousMetaRegistry(`The global registry`) as GlobalRegistry;

export const getRegistryById: GlobalRegistry['get'] = (key) => {
    // @ts-ignore
    return globalRegistry.get(key);
}

export const getGlobalRegistry = () => globalRegistry;
