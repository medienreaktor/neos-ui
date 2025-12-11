import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {Icon, Button} from '@neos-project/react-ui-components';

import {actions} from '@neos-project/neos-ui-redux-store';

@connect(null, {
    copyNode: actions.CR.Nodes.copy
})
export default class CopySelectedNode extends PureComponent {
    static propTypes = {
        className: PropTypes.string,
        contextPath: PropTypes.string,
        destructiveOperationsAreDisabled: PropTypes.bool.isRequired,
        isCopied: PropTypes.bool.isRequired,
        copyNode: PropTypes.func.isRequired,
        i18nRegistry: PropTypes.object.isRequired
    };

    handleCopySelectedNodeClick = () => {
        const {contextPath, copyNode} = this.props;

        copyNode(contextPath);
    }

    render() {
        const {destructiveOperationsAreDisabled, className, isCopied, i18nRegistry} = this.props;

        return (
            <Button
                id="neos-InlineToolbar-CopySelectedNode"
                className={className}
                disabled={destructiveOperationsAreDisabled}
                isActive={isCopied}
                onClick={this.handleCopySelectedNodeClick}
                hoverStyle="brand"
                style="transparent"
                size="small"
                title={i18nRegistry.translate('copy')}
            >
                {i18nRegistry.translate('copy')}
                <Icon icon="far copy" />
            </Button>
        );
    }
}
