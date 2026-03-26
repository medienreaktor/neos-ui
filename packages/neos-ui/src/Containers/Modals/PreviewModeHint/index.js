import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {selectors} from '@neos-project/neos-ui-redux-store';
import {translate} from '@neos-project/neos-ui-i18n';
import {getConfiguration} from '@neos-project/neos-ui-configuration';

import {Dialog, Button} from '@neos-project/react-ui-components';
import style from './style.module.css';

export const LOCAL_STORAGE_KEY = 'neos-previewModeHintDismissed';

@connect(state => ({
    editPreviewMode: selectors.UI.EditPreviewMode.currentEditPreviewMode(state)
}))
class PreviewModeHint extends PureComponent {
    static propTypes = {
        editPreviewMode: PropTypes.string.isRequired
    }

    state = {
        isOpen: false
    }

    componentDidMount() {
        this.checkPreviewMode();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.editPreviewMode !== this.props.editPreviewMode) {
            this.checkPreviewMode();
        }
    }

    checkPreviewMode() {
        const {editPreviewMode} = this.props;
        const editPreviewModes = getConfiguration(c => c.editPreviewModes);
        const currentMode = editPreviewModes[editPreviewMode];

        if (currentMode?.isPreviewMode && !localStorage.getItem(LOCAL_STORAGE_KEY)) {
            this.setState({isOpen: true});
        }
    }

    handleClose = () => {
        localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
        this.setState({isOpen: false});
    }

    renderCloseAction() {
        return (
            <Button
                id="neos-PreviewModeHint-Close"
                key="close"
                style="lighter"
                hoverStyle="brand"
                onClick={this.handleClose}
            >
                {translate('Neos.Neos:Main:close', 'Close')}
            </Button>
        );
    }

    render() {
        const {isOpen} = this.state;

        return (
            <Dialog
                actions={[this.renderCloseAction()]}
                title={translate('Neos.Neos.Ui:Main:previewModeHint.title', 'Preview Mode')}
                isOpen={isOpen}
                onRequestClose={this.handleClose}
                style="narrow"
            >
                <div className={style.previewModeHint__message}>
                    {translate(
                        'Neos.Neos.Ui:Main:previewModeHint.message',
                        'You are currently in preview mode. In this mode, the page is displayed as it will appear to visitors. Editing of content is not available while preview mode is active. You can switch back to editing mode using the mode selector in the toolbar.'
                    )}
                </div>
            </Dialog>
        );
    }
}

export default PreviewModeHint;
