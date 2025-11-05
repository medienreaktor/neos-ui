import React, {useCallback} from 'react';
import {connect} from 'react-redux';

import {Icon, Button} from '@neos-project/react-ui-components';
import {actions, selectors, useSelector} from '@neos-project/neos-ui-redux-store';
import {I18nRegistry} from '@neos-project/neos-ui-i18n';
import {FusionPath, NodeContextPath} from '@neos-project/neos-ts-interfaces';

type DuplicateSelectNodeProps = {
    className: string;
    contextPath: NodeContextPath;
    fusionPath: FusionPath;
    destructiveOperationsAreDisabled: boolean;
    isCopied: boolean;
    duplicateNode: (contextPath: NodeContextPath, fusionPath: FusionPath) => void;
    i18nRegistry: I18nRegistry;
}

const withReduxState = connect(() => ({}), {
    duplicateNode: actions.CR.Nodes.duplicate
});

const DuplicateSelectedNode: React.FC<DuplicateSelectNodeProps> = ({
                                                                       contextPath,
                                                                       fusionPath,
                                                                       destructiveOperationsAreDisabled,
                                                                       className,
                                                                       i18nRegistry,
                                                                       duplicateNode
                                                                   }) => {
    const focusedNodeContextPath = useSelector(selectors.CR.Nodes.focusedNodePathSelector);
    const handleDuplicateSelectedNode = useCallback(() => {
        if (focusedNodeContextPath) {
            duplicateNode(contextPath, fusionPath);
        }
    }, []);

    return (
        <Button
            id="neos-InlineToolbar-DuplicateSelectedNode"
            className={className}
            disabled={destructiveOperationsAreDisabled}
            onClick={handleDuplicateSelectedNode}
            hoverStyle="brand"
            size="small"
            title={i18nRegistry.translate('Neos.Neos.Ui:Main:duplicate--title')}
        >
            {i18nRegistry.translate('Neos.Neos.Ui:Main:duplicate')}
            <Icon icon="far clone"/>
        </Button>
    );
}

export default React.memo(withReduxState(DuplicateSelectedNode as any));
