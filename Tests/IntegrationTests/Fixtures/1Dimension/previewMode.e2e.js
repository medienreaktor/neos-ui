import {ReactSelector} from 'testcafe-react-selectors';
import {beforeEach, subSection, checkPropTypes} from './../../utils';
import {Page} from './../../pageModel';

/* global fixture:true */

fixture`Edit Preview Mode`
    .beforeEach(beforeEach)
    .afterEach(() => checkPropTypes());

test('PreviewBadge is shown in preview mode and hidden in editing mode', async t => {
    subSection('Badge is hidden by default (inPlace editing mode)');
    await t
        .expect(ReactSelector('PreviewBadge').find('div').exists).notOk();

    subSection('Switch to preview mode');
    await t
        .click(ReactSelector('EditPreviewModeDropDown ContextDropDownHeader'))
        .click(
            ReactSelector('EditPreviewModeDropDown ContextDropDownContents')
                .find('button').withText('Preview')
        );

    subSection('Badge is now visible');
    await t
        .expect(await Page.getReduxState(state => state.ui.editPreviewMode))
        .eql('preview')
        .expect(ReactSelector('PreviewBadge').find('div').exists).ok();

    subSection('Switch back to editing mode');
    await t
        .click(ReactSelector('EditPreviewModeDropDown ContextDropDownHeader'))
        .click(
            ReactSelector('EditPreviewModeDropDown ContextDropDownContents')
                .find('button').withText('In-Place')
        );

    subSection('Badge is hidden again');
    await t
        .expect(ReactSelector('PreviewBadge').find('div').exists).notOk();
});
