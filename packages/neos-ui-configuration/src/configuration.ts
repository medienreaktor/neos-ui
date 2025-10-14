import {configuration} from './system';

export interface Configuration {
    // the "Neos.Neos.userInterface.navigateComponent.nodeTree" configuration
    nodeTree: {
        loadingDepth?: number,
        presets?: {
            default: {
                baseNodeType?: string
            },
            [presetName: string]: {
                baseNodeType?: string
                ui?: {
                    label: string
                    icon: string
                }
            }
        }
    },
    // the "Neos.Neos.userInterface.navigateComponent.structureTree" configuration
    structureTree: {
        loadingDepth?: number,
    }
    allowedTargetWorkspaces: {
        [name: string]: {
            name: string
            title: string
            readonly: boolean
        }
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
