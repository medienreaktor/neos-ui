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
 * For selecting a subset its preferred to pass a closure.
 */
export function getConfiguration(): Configuration;
export function getConfiguration<R>(selector: (configuration: Configuration) => R): R;
export function getConfiguration(selector?: any) {
    if (selector) {
        return selector(configuration);
    }
    return configuration;
}
