import manifest from '@neos-project/neos-ui-extensibility';
import {getFrontendConfigurationForPackage} from '@neos-project/neos-ui-configuration';

export const globalFrontendConfigurationAccess = getFrontendConfigurationForPackage('@neos-project/neos-ui-test-plugin');

export let manifestInvocations = 0;

export let legacyFrontendConfigurationAccess: any = null;

manifest('@neos-project/neos-ui-test-plugin', {}, (globalRegistry, {frontendConfiguration}) => {
    manifestInvocations++;
    legacyFrontendConfigurationAccess = frontendConfiguration['@neos-project/neos-ui-test-plugin'];
});
