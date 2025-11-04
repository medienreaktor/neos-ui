import React, {ReactElement, useCallback, useEffect, useRef, useState} from 'react';
import mergeClassNames from 'classnames';
import debounce from 'lodash.debounce';

import {findNodeInGuestFrame, getGuestFrameWindow} from '@neos-project/neos-ui-guest-frame/src/dom';
import {Icon, IconButton} from '@neos-project/react-ui-components';
import {translate} from '@neos-project/neos-ui-i18n';
import {neos} from '@neos-project/neos-ui-decorators';
import {selectors, useSelector} from '@neos-project/neos-ui-redux-store';
import {NodeTypesRegistry} from '@neos-project/neos-ui-contentrepository';
import {SynchronousRegistry} from '@neos-project/neos-ui-registry';

import style from './style.module.css';

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

const withNeosGlobals = neos((globalRegistry) => ({
    nodeTypesRegistry: globalRegistry.get('@neos-project/neos-ui-contentrepository'),
    guestFrameRegistry: globalRegistry.get('@neos-project/neos-ui-guest-frame'),
}));

type ContextToolbarProps = {
    buttonProps?: { [key: string]: any };
    nodeTypesRegistry: NodeTypesRegistry;
    guestFrameRegistry: SynchronousRegistry<ReactElement>;
    fusionPath: string;
}

/**
 * The ContextToolbar contains buttons for context specific operations on nodes,
 * like copying, hiding, moving deleting the focused node.
 */
const ContextToolbar: React.FC<ContextToolbarProps> = ({
    buttonProps,
    nodeTypesRegistry,
    guestFrameRegistry,
    fusionPath,
}) => {
    const focusedNode = useSelector(selectors.CR.Nodes.focusedSelector);
    const iframeWindow = useRef(getGuestFrameWindow()).current;
    const [isSticky, setIsSticky] = useState(false);
    const debouncedStickyRef = useRef();

    const updateStickiness = useCallback(() => {
        if (!focusedNode) {
            return;
        }
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

    const focusedNodeType = focusedNode ? nodeTypesRegistry.get(focusedNode.nodeType) : null;
    const focusedNodeLabel = focusedNode ? formatNodeLabel(focusedNode.label) : null;
    const focusedNodeTypeIcon = focusedNodeType?.ui?.icon || 'cube';

    const buttons = guestFrameRegistry.getChildren('NodeToolbar/SecondaryButtons');
    const contextButtons = guestFrameRegistry.getChildren('NodeToolbar/ContextButtons');

    const classNames = mergeClassNames({
        [style.contextToolBar]: true,
        [style['contextToolBar--isSticky']]: isSticky
    });

    // TODO: Try to solve the sticky toolbar with a second anchor instead of the scroll event

    // The data attribute data-ignore_click_outside is used to disable the enhanceWithClickOutside
    // handling. For the special case that the outOfBandRender returns an empty rendered content
    // we need to disable the enhanceWithClickOutside handling to prevent hick ups in the event
    // registration after guest frame reload.
    return (
        <div className={classNames} id="inline-ui-toolbar-popover">
            <div className={style.toolBar} data-ignore_click_outside="true">
                {contextButtons.map((Item: ReactElement, key) => <Item key={key} {...buttonProps} />)}
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

export default React.memo(withNeosGlobals(ContextToolbar as any));
