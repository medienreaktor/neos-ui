import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import {mount} from 'enzyme';
import {setupI18n} from '@neos-project/neos-ui-i18n';
import PreviewBadge from './index';

beforeAll(() => {
    setupI18n('en-US', 'one,other', {});
});

test('PreviewBadge > is visible in preview mode', () => {
    const store = createStore(state => state, {
        ui: {editPreviewMode: 'previewMode'}
    });

    const component = mount(
        <Provider store={store}>
            <PreviewBadge />
        </Provider>
    );

    expect(component.find('.secondaryToolbar__previewBadge').length).toBe(1);
});

test('PreviewBadge > is hidden in edit mode', () => {
    const store = createStore(state => state, {
        ui: {editPreviewMode: 'inPlace'}
    });

    const component = mount(
        <Provider store={store}>
            <PreviewBadge />
        </Provider>
    );

    expect(component.find('.secondaryToolbar__previewBadge').length).toBe(0);
});
