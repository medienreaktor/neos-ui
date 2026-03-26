import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import {selectors} from '@neos-project/neos-ui-redux-store';
import {translate} from '@neos-project/neos-ui-i18n';
import {getConfiguration} from '@neos-project/neos-ui-configuration';

import style from '../style.module.css';

@connect(state => ({
    currentEditPreviewMode: selectors.UI.EditPreviewMode.currentEditPreviewMode(state)
}))
export default class PreviewBadge extends PureComponent {
    static propTypes = {
        currentEditPreviewMode: PropTypes.string.isRequired
    };

    render() {
        const {currentEditPreviewMode} = this.props;
        const editPreviewModes = getConfiguration(c => c.editPreviewModes);
        const currentMode = editPreviewModes[currentEditPreviewMode];
        const isPreviewMode = currentMode?.isPreviewMode === true;

        if (!isPreviewMode) {
            return null;
        }

        return (
            <div className={style.secondaryToolbar__previewBadge}>
                {translate('Neos.Neos.Ui:Main:contentCanvas.previewModeBadge', 'No editing in preview mode')}
            </div>
        );
    }
}
