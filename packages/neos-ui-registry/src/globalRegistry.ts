import {SynchronousMetaRegistry, SynchronousRegistry} from './registry';

export interface GlobalRegistry {
    get<T>(key: string): SynchronousRegistry<T> | null;
    set<T>(key: string, registry: SynchronousRegistry<T>): SynchronousRegistry<T>;
}

/**
 * Access to the global registry.
 *
 * FIXME
 * Note that we often pass the global registry around instead and inject it via the react context -> this should be simplified in favour of this global state.
 */
// FIXME SynchronousMetaRegistry vs GlobalRegistry type dilemma
const globalRegistry = new SynchronousMetaRegistry(`The global registry`) as unknown as GlobalRegistry;

export const getRegistryById: GlobalRegistry['get'] = (key) => {
    // @ts-ignore
    return globalRegistry.get(key);
}

export const getGlobalRegistry = () => globalRegistry;
