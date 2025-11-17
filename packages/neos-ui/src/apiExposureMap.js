import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import * as reactRedux from 'react-redux';
import * as reduxActions from 'redux-actions';
import * as reduxSaga from 'redux-saga';
import * as reduxSagaEffects from 'redux-saga/effects';
import * as reselect from 'reselect';
import * as reactCssThemr from '@friendsofreactjs/react-css-themr';
import * as ReactDND from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import * as ReactUiComponents from '@neos-project/react-ui-components';
import * as NeosUiReduxStore from '@neos-project/neos-ui-redux-store';
import * as NeosUiDecorators from '@neos-project/neos-ui-decorators';
import * as NeosUiEditors from '@neos-project/neos-ui-editors/src/index';
import * as UtilsRedux from '@neos-project/utils-redux';
import NeosUiI18n from '@neos-project/neos-ui-i18n';
import * as CkEditorApi from '@neos-project/neos-ui-ckeditor5-bindings/src/ckEditorApi';
import NeosUiBackendConnectorDefault, * as NeosUiBackendConnector from '@neos-project/neos-ui-backend-connector';
import * as NeosUiViews from '@neos-project/neos-ui-views';
import * as NeosUiGuestFrameDom from '@neos-project/neos-ui-guest-frame/src/dom';
import * as NeosUiRegistry from '@neos-project/neos-ui-registry';
import * as NeosUiConfiguration from '@neos-project/neos-ui-configuration';

// We export most needed components from CKE5 to be used when making custom plugins.
// It's not safe to just install CKE5 packages from the extension because then "instanceof" checks will no longer work,
// which would break CKE5 in some places.
// Feel free to export and register shims for more ckeditor packages as needed.

import {
    ViewDowncastWriter,
    Matcher,
    EditingView,
    ViewDomConverter,
    disableViewPlaceholder,
    enableViewPlaceholder,
    hideViewPlaceholder,
    needsViewPlaceholder,
    showViewPlaceholder
} from '@ckeditor/ckeditor5-engine';

// With the new exports in CKE6 v45+, we can fully import and re-export the CKE5 various modules.
import * as CkEditor5Core from '@ckeditor/ckeditor5-core';
import * as CkEditor5Engine from '@ckeditor/ckeditor5-engine';
import * as CkEditor5Widget from '@ckeditor/ckeditor5-widget';
import * as CkEditor5Highlight from '@ckeditor/ckeditor5-highlight';
import * as CkEditor5Ui from '@ckeditor/ckeditor5-ui';

// Compatibility export for CkEditor5 for plugins using older CKE5 versions (<46)
const CkEditor5 = {
    ...CkEditor5Core,
    ...CkEditor5Engine,
    ...CkEditor5Widget,
    ...CkEditor5Highlight,
    ...CkEditor5Ui,

    // Backwards compatibility with CK5 < 46 as some class names changed
    DownCastWriter: ViewDowncastWriter,
    View: EditingView,
    ViewDOMConverter: ViewDomConverter,
    ViewMatcher: Matcher,
    ViewPlaceholder: {
        disableViewPlaceholder,
        enableViewPlaceholder,
        hideViewPlaceholder,
        needsViewPlaceholder,
        showViewPlaceholder,
    },
};

export default {
    '@vendor': () => ({
        React,
        ReactDOM,
        PropTypes,
        classnames,
        reactRedux,
        reduxActions,
        reduxSaga,
        reduxSagaEffects,
        reselect,
        reactCssThemr,
        CkEditor5, // Backwards compatible export
        CkEditor5Engine,
        CkEditor5Core,
        CkEditor5Widget,
        CkEditor5Highlight,
        CkEditor5Ui,
        HTML5Backend,
        ReactDND
    }),

    '@NeosProjectPackages': () => ({
        NeosUiBackendConnectorDefault,
        NeosUiBackendConnector,
        CkEditorApi,
        NeosUiDecorators,
        NeosUiEditors,
        NeosUiI18n,
        NeosUiReduxStore,
        NeosUiViews,
        NeosUiGuestFrameDom,
        // react-proptypes (optional)
        ReactUiComponents,
        NeosUiRegistry,
        NeosUiConfiguration,
        UtilsRedux

        // TODO: how to write new reducers?
        // TODO: how to write new sagas? -> Registry --> CUSTOM PACKAGE
        // TODO: How to replace containers -> Registry --> CUSTOM PACKAGE
    })
};
