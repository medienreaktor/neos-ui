import manifest from '@neos-project/neos-ui-extensibility';
import {getFrontendConfigurationForPackage} from '@neos-project/neos-ui-configuration';

const globalFrontendConfigurationAccess = getFrontendConfigurationForPackage('@neos-project/neos-ui-test-plugin');

manifest('@neos-project/neos-ui-test-plugin', {}, ({frontendConfiguration}) => {
    const legacyFrontendConfigurationAccess = frontendConfiguration['@neos-project/neos-ui-test-plugin'];

    (window as any).neosUiTestPlugin = {
        ...(window as any).neosUiTestPlugin,
        legacyFrontendConfigurationAccess,
    };
});

// register globally to fetch in e2e tests
(window as any).neosUiTestPlugin = {
    globalFrontendConfigurationAccess,
};
