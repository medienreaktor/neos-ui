import React from 'react';
import {connect} from 'react-redux';

import {actions, selectors, GlobalState} from '@neos-project/neos-ui-redux-store';
import {neos} from '@neos-project/neos-ui-decorators';
import {Node} from '@neos-project/neos-ts-interfaces';
import {NodeTypesRegistry} from '@neos-project/neos-ui-contentrepository';
import {Button, Icon} from '@neos-project/react-ui-components';

import style from './style.module.css';

const withReduxState = connect((state: GlobalState) => ({
    focusedNodeParentLine: selectors.CR.Nodes.focusedNodeParentLineSelector(state),
    focusedNode: selectors.CR.Nodes.focusedSelector(state)
}), {
    focusNode: actions.CR.Nodes.focus
});

const withNeosGlobals = neos((globalRegistry) => ({
    nodeTypesRegistry: globalRegistry.get('@neos-project/neos-ui-contentrepository')
}));

const Breadcrumb: React.FC<{
    focusedNode: Node | null,
    focusedNodeParentLine: Node[],
    focusNode: (contextPath: string) => void,
    nodeTypesRegistry: NodeTypesRegistry
}> = ({
    focusedNode,
    focusedNodeParentLine,
    focusNode,
    nodeTypesRegistry
}) => {
    const handleSelectNode = React.useCallback((selectedNodeContextPath: string) => {
        if (selectedNodeContextPath && selectedNodeContextPath !== focusedNode?.contextPath) {
            focusNode(selectedNodeContextPath);
        }
    }, [focusNode, focusedNode]);

    const closestDocumentNodeInParentLineIndex = focusedNodeParentLine
        .findIndex((node) => nodeTypesRegistry.hasRole(node.nodeType, 'document'));

    if (closestDocumentNodeInParentLineIndex !== -1) {
        focusedNodeParentLine = focusedNodeParentLine
            .slice(0, Math.min(2, closestDocumentNodeInParentLineIndex + 1));
    }
    return (
        <section className={style.breadcrumb}>
            <ol>
                {focusedNodeParentLine
                    .reverse()
                    .map((node) => {
                        const nodeType = nodeTypesRegistry.get(node.nodeType);
                        const isActive = node.contextPath === focusedNode?.contextPath;
                        const labelMaxLength = isActive ? 30 : 15;
                        return (
                            <li key={node.contextPath}>
                                <Button
                                    onClick={() => handleSelectNode(node.contextPath)}
                                    style="transparent"
                                    hoverStyle="clean"
                                    size="small"
                                    title={node.label}
                                >
                                    <Icon icon={nodeType?.ui?.icon || 'file'} />
                                    {node.label.slice(0, labelMaxLength) + (node.label.length > labelMaxLength ? '…' : '')}
                                </Button>
                            </li>
                        )
                    })}
            </ol>
        </section>
    );
}

export default React.memo(withReduxState(withNeosGlobals(Breadcrumb as any)));
