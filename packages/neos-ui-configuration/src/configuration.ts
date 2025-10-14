import {configuration} from './system';

export interface Configuration {
    nodeTree?: {
        loadingDepth?: number
    }
}

/**
 * Access to the global configuration.
 *
 * Note that we often pass the configuration around instead and inject it via the react context -> this should be simplified in favour of this global state.
 */
export function getConfiguration(): Configuration {
    return configuration as Configuration;
}
