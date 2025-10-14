import {frontendConfiguration} from './system';
import {GlobalRegistry, SynchronousRegistry} from '@neos-project/neos-ui-registry';

/**
 * Frontend configuration
 *
 * Any setting from Flows configuration 'Neos.Neos.Ui.frontendConfiguration' is available here.
 *
 * API for third party packages to deliver own settings to the UI at boot time.
 * Settings from each package should be prefixed to avoid collisions:
 *
 * Neos:
 *     Neos:
 *         Ui:
 *             frontendConfiguration:
 *                 'Your.Own:Package':
 *                     someKey: someValue
 *
 * Then it may be accessed via {@see getFrontendConfigurationForPackage()}
 */
export function getFrontendConfigurationForPackage(packageKey: string): Record<string, any> | null {
    if (frontendConfiguration && packageKey in (frontendConfiguration as any)) {
        return (frontendConfiguration as any)[packageKey];
    }
    return null;
}

/**
 * @deprecated For legacy compatibility use getFrontendConfigurationForPackage() instead
 */
export function getFullPackageFrontendConfiguration(): Record<string, any> {
    return frontendConfiguration as any;
}

/**
 * @deprecated Use `import {getFrontendConfiguration} from '@neos-project/neos-ui-configuration'` instead
 */
const frontendConfigurationRegistry = new SynchronousRegistry(`Frontend configuration registry`);

/**
 * @internal
 */
export function initializeFrontendConfiguration(globalRegistry: GlobalRegistry) {
    globalRegistry.set('frontendConfiguration', frontendConfigurationRegistry);

    if (!frontendConfiguration || typeof frontendConfiguration !== 'object') {
        console.warn('Skipped initializing the frontendConfiguration registry invalid value: ', frontendConfiguration);
        return;
    }

    Object.entries(frontendConfiguration).forEach(([key, value]) => {
        frontendConfigurationRegistry.set(key, {
            ...value
        });
    });
}
