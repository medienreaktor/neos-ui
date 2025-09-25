import React, {ReactElement} from 'react';
import mergeClassNames from "classnames";

import {Icon, IconButton} from "@neos-project/react-ui-components";
import {translate} from '@neos-project/neos-ui-i18n';

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

type ContextToolbarProps = {
    focusedNode: { label: string };
    focusedNodeType?: { ui?: { icon?: string } };
    isSticky: boolean;
    buttons: ReactElement[];
    buttonProps?: { [key: string]: any };
}

const ContextToolbar: React.FC<ContextToolbarProps> = ({
                                                           focusedNode,
                                                           focusedNodeType,
                                                           isSticky,
                                                           buttons,
                                                           buttonProps
                                                       }) => {

    const focusedNodeLabel = formatNodeLabel(focusedNode.label);
    const focusedNodeTypeIcon = focusedNodeType?.ui?.icon || 'cube';

    const classNames = mergeClassNames({
        [style.toolBar__popover]: true,
        [style['toolBar__popover--isSticky']]: isSticky
    });

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

export default React.memo(ContextToolbar);
