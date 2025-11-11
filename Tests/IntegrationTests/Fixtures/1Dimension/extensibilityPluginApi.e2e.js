import {ClientFunction} from 'testcafe';
import {beforeEach, subSection, checkPropTypes} from '../../utils';

/* global fixture:true */

fixture`Extensibility Plugin Api`.beforeEach(beforeEach).afterEach(() => checkPropTypes());

test('Check plugin status via developer api (console)', async t => {
    subSection('Manifest boot');
    await t.expect(ClientFunction(() => window.neosUiTestPlugin.manifestInvocations)()).eql(1);
    await t.expect(ClientFunction(() => window.neosUiTestPlugin.globalGlobalRegistryAccess)()).eql('global registry type object name SynchronousMetaRegistry');
    await t.expect(ClientFunction(() => window.neosUiTestPlugin.legacyGlobalRegistryAccess)()).eql('global registry type object name SynchronousMetaRegistry');

    subSection('Create and access custom registry');
    await t.expect(ClientFunction(() => window.neosUiTestPlugin.getPluginRegistryValue())()).eql('some value from my registry');
    await t.expect(ClientFunction(() => window.neosUiTestPlugin.getPluginLegacyRegistryValue())()).eql('some value from my legacy registry');

    subSection('Neos Ui Configuration Access');
    await t.expect(ClientFunction(() => window.neosUiTestPlugin.globalConfigurationAccess)()).eql('loadingDepth type number');
    await t.expect(ClientFunction(() => window.neosUiTestPlugin.legacyConfigurationAccess)()).eql('loadingDepth type number');

    subSection('Frontend Configuration Access');
    await t.expect(ClientFunction(() => window.neosUiTestPlugin.globalFrontendConfigurationAccess)()).eql(
        {
            testConfig: 'la li lu'
        }
    );
    await t.expect(ClientFunction(() => window.neosUiTestPlugin.legacyFrontendConfigurationAccess)()).eql(
        {
            testConfig: 'la li lu'
        }
    );
});
