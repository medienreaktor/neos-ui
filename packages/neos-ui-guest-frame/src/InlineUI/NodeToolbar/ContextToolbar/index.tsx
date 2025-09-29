import React, {ReactElement, useCallback, useEffect, useRef, useState} from 'react';
import {connect} from 'react-redux';
import mergeClassNames from 'classnames';
import debounce from 'lodash.debounce';

import {findNodeInGuestFrame, getGuestFrameWindow} from '@neos-project/neos-ui-guest-frame/src/dom';
import {Icon, IconButton} from '@neos-project/react-ui-components';
import {translate} from '@neos-project/neos-ui-i18n';
import {neos} from '@neos-project/neos-ui-decorators';
import {selectors} from '@neos-project/neos-ui-redux-store';
import {GlobalState} from '@neos-project/neos-ui-redux-store/src/System';

import style from './style.module.css';
import {NodeTypesRegistry} from '@neos-project/neos-ts-interfaces';
import {SynchronousRegistry} from '@neos-project/neos-ui-extensibility';

const HTML_ENTITIES: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&ndash;': '-',
};

/**
 * Format node label by replacing html entities and trimming to max length
 */
const formatNodeLabel = (label: string, maxLength = 20) => {
    let nodeLabel = label;

    // Replace html special characters, unmatched entities are replaced with a space
    nodeLabel = nodeLabel.replace(/&[\w#]+;/g, (entity) => {
        return HTML_ENTITIES[entity] || ' ';
    });

    // Trim to max length characters
    return nodeLabel.substring(0, maxLength) + (nodeLabel.length > maxLength ? '…' : '');
}

const withReduxState = connect((state: GlobalState) => ({
    focusedNode: selectors.CR.Nodes.focusedSelector(state),
}));

const withNeosGlobals = neos((globalRegistry) => ({
    nodeTypesRegistry: globalRegistry.get('@neos-project/neos-ui-contentrepository'),
    guestFrameRegistry: globalRegistry.get('@neos-project/neos-ui-guest-frame'),
}));

type ContextToolbarProps = {
    focusedNode: { label: string, nodeType: string, contextPath: string };
    buttonProps?: { [key: string]: any };
    nodeTypesRegistry: NodeTypesRegistry;
    guestFrameRegistry: SynchronousRegistry<ReactElement>;
    fusionPath: string;
}

const ContextToolbar: React.FC<ContextToolbarProps> = ({
    focusedNode,
    buttonProps,
    nodeTypesRegistry,
    guestFrameRegistry,
    fusionPath,
}) => {
    const iframeWindow = useRef(getGuestFrameWindow()).current;
    const [isSticky, setIsSticky] = useState(false);
    const debouncedStickyRef = useRef();

    const updateStickiness = useCallback(() => {
        const nodeElement = findNodeInGuestFrame(focusedNode.contextPath, fusionPath);
        if (nodeElement) {
            const {top, bottom} = nodeElement.getBoundingClientRect();
            const shouldBeSticky = top < 50 && bottom > 0;
            setIsSticky(shouldBeSticky);
        }
    }, [focusedNode, fusionPath]);

    useEffect(() => {
        debouncedStickyRef.current = debounce(updateStickiness, 5);
    }, [updateStickiness]);

    useEffect(() => {
        if (!iframeWindow) return;

        iframeWindow.addEventListener('scroll', debouncedStickyRef.current);
        updateStickiness();

        return () => {
            iframeWindow.removeEventListener('scroll', debouncedStickyRef.current);
        };
    }, [updateStickiness]);

    const focusedNodeType = nodeTypesRegistry.get(focusedNode.nodeType);
    const focusedNodeLabel = formatNodeLabel(focusedNode.label);
    const focusedNodeTypeIcon = focusedNodeType?.ui?.icon || 'cube';

    const buttons = guestFrameRegistry.getChildren('NodeToolbar/SecondaryButtons');

    const classNames = mergeClassNames({
        [style.toolBar__popover]: true,
        [style['toolBar__popover--isSticky']]: isSticky
    });

    // TODO: Try to solve the sticky toolbar with a second anchor instead of the scroll event

    // The data attribute data-ignore_click_outside is used to disable the enhanceWithClickOutside
    // handling. For the special case that the outOfBandRender returns an empty rendered content
    // we need to disable the enhanceWithClickOutside handling to prevent hick ups in the event
    // registration after guest frame reload.
    return (
        <div className={classNames} id="inline-ui-toolbar-popover">
            <div className={style.toolBar} data-ignore_click_outside="true">
                <span className={style.contextToolbar__nodeLabel}>
                    <Icon icon={focusedNodeTypeIcon}/>
                    {focusedNodeLabel}
                </span>
                <div className={style.toolBar__contextMenuToggleWrapper}>
                    <IconButton
                        className={style.toolBar__contextMenuToggle}
                        popovertarget="inline-ui-toolbar-context-menu"
                        icon="ellipsis-vertical"
                        onClick={void 0}
                        hoverStyle="brand"
                        size="small"
                        title={translate('Neos.Neos.Ui:Main:toggleContextMenu', 'Toggle context menu')}
                    />
                    <div
                        id="inline-ui-toolbar-context-menu"
                        className={style.toolBar__contextMenu}
                        popover="auto"
                    >
                        <div className={style.toolBar__btnGroupVertical}>
                            {buttons.map((Item: ReactElement, key) => <Item key={key} {...buttonProps} />)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default React.memo(withReduxState(withNeosGlobals(ContextToolbar as any)));
