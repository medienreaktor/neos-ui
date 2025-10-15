import {ClientFunction} from 'testcafe';
import {beforeEach, subSection, checkPropTypes} from '../../utils';

/* global fixture:true */

fixture`Extensibility Plugin Api`.beforeEach(beforeEach).afterEach(() => checkPropTypes());

test('Check plugin status via console', async t => {
    subSection('Manifest boot');
    await t.expect(ClientFunction(() => window.neosUiTestPlugin.manifestInvocations)()).eql(1);

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
