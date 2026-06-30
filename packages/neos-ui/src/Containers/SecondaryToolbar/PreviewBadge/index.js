import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import {selectors} from '@neos-project/neos-ui-redux-store';
import {translate} from '@neos-project/neos-ui-i18n';
import {getConfiguration} from '@neos-project/neos-ui-configuration';

import style from '../style.module.css';

const PreviewBadge = ({currentEditPreviewMode, isWorkspaceReadOnly}) => {
    const editPreviewModes = getConfiguration(c => c.editPreviewModes);
    const currentMode = editPreviewModes[currentEditPreviewMode];
    const isPreviewMode = currentMode?.isPreviewMode === true;

    if (!isPreviewMode && !isWorkspaceReadOnly) {
        return null;
    }

    return (
        <div className={style.secondaryToolbar__previewBadge}>
            {translate('Neos.Neos.Ui:Main:contentCanvas.previewModeBadge', 'No editing in preview mode')}
        </div>
    );
};

PreviewBadge.propTypes = {
    currentEditPreviewMode: PropTypes.string.isRequired,
    isWorkspaceReadOnly: PropTypes.bool.isRequired
};

export default connect(state => ({
    currentEditPreviewMode: selectors.UI.EditPreviewMode.currentEditPreviewMode(state),
    isWorkspaceReadOnly: selectors.CR.Workspaces.isWorkspaceReadOnlySelector(state)
}))(PreviewBadge);
