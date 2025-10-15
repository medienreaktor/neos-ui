import manifest from '@neos-project/neos-ui-extensibility';
import {getConfiguration, getFrontendConfigurationForPackage} from '@neos-project/neos-ui-configuration';
import {getGlobalRegistry, getRegistryById, SynchronousRegistry} from "@neos-project/neos-ui-registry";

export let manifestInvocations = 0;

export const globalFrontendConfigurationAccess = getFrontendConfigurationForPackage('@neos-project/neos-ui-test-plugin');

export let legacyFrontendConfigurationAccess: any;

export const globalConfigurationAccess = `loadingDepth type ${typeof getConfiguration(configuration => configuration.nodeTree.loadingDepth)}`;

export let legacyConfigurationAccess: string | undefined;

export const globalGlobalRegistryAccess = `global registry type ${typeof getGlobalRegistry()} name ${getGlobalRegistry().constructor.name}`;

export let legacyGlobalRegistryAccess: string | undefined;

export function getPluginRegistryValue() {
    return getRegistryById('@neos-project/neos-ui-test-plugin-registry').get('someKey');
}

manifest('@neos-project/neos-ui-test-plugin', {}, (globalRegistry, {frontendConfiguration, configuration}) => {
    manifestInvocations++;
    legacyGlobalRegistryAccess = `global registry type ${typeof globalRegistry} name ${globalRegistry.constructor.name}`;

    legacyFrontendConfigurationAccess = frontendConfiguration['@neos-project/neos-ui-test-plugin'];
    legacyConfigurationAccess = `loadingDepth type ${typeof configuration.nodeTree.loadingDepth}`;

    const myCustomRegistry = new SynchronousRegistry<string>('My registry');
    globalRegistry.set('@neos-project/neos-ui-test-plugin-registry', myCustomRegistry);

    myCustomRegistry.set('someKey', 'some value from my registry');
});
