import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {Icon, Button} from '@neos-project/react-ui-components';

import {actions} from '@neos-project/neos-ui-redux-store';

@connect(null, {
    cutNode: actions.CR.Nodes.cut
})
export default class CutSelectedNode extends PureComponent {
    static propTypes = {
        className: PropTypes.string,
        contextPath: PropTypes.string,
        destructiveOperationsAreDisabled: PropTypes.bool.isRequired,
        isCut: PropTypes.bool.isRequired,
        canBeEdited: PropTypes.bool.isRequired,
        cutNode: PropTypes.func.isRequired,
        i18nRegistry: PropTypes.object.isRequired
    };

    handleCutSelectedNodeClick = () => {
        const {contextPath, cutNode} = this.props;

        cutNode(contextPath);
    }

    render() {
        const {
            destructiveOperationsAreDisabled,
            isCut,
            className,
            canBeEdited,
            i18nRegistry
        } = this.props;

        return (
            <Button
                id="neos-InlineToolbar-CutSelectedNode"
                className={className}
                isActive={isCut}
                disabled={destructiveOperationsAreDisabled || !canBeEdited}
                onClick={this.handleCutSelectedNodeClick}
                hoverStyle="brand"
                style="transparent"
                size="small"
                title={i18nRegistry.translate('cut')}
            >
                {i18nRegistry.translate('cut')}
                <Icon name="cut" />
            </Button>
        );
    }
}
