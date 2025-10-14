import {getInlinedDataFromBackend} from './bootstrap';

const configuration = getInlinedDataFromBackend('configuration') as Configuration;

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
    },
    // the "Neos.Neos.userInterface.editPreviewModes" configuration
    editPreviewModes: {
        [name: string]: {
            isEditingMode: boolean,
            isPreviewMode: boolean,
            title: string,
            position?: string | number
        }
    }
}

/**
 * Access to the global configuration.
 *
 * Note that we often pass the configuration around instead and inject it via the react context -> this should be simplified in favour of this global state.
 */
export function getConfiguration(): Configuration {
    return configuration;
}

export function getEditPreviewModesConfiguration(): Configuration['editPreviewModes'] {
    return configuration.editPreviewModes;
}
