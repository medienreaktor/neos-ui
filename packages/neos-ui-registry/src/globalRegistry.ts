import {SynchronousMetaRegistry, SynchronousRegistry} from '@neos-project/neos-ui-extensibility/src/registry';
import {GlobalRegistry} from '@neos-project/neos-ts-interfaces';

/**
 * Access to the global registry.
 *
 * FIXME
 * Note that we often pass the global registry around instead and inject it via the react context -> this should be simplified in favour of this global state.
 */
// FIXME SynchronousMetaRegistry vs GlobalRegistry type dilemma
const globalRegistry = new SynchronousMetaRegistry(`The global registry`) as unknown as GlobalRegistry;

export const getRegistryById = <T>(id: string): SynchronousRegistry<T> | null => {
    return globalRegistry.get(id);
}

export const getGlobalRegistry = () => globalRegistry;
