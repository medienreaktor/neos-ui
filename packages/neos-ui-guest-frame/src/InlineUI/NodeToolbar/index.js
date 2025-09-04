import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import mergeClassNames from 'classnames';
import debounce from 'lodash.debounce';

import {
    findNodeInGuestFrame,
    getAbsolutePositionOfElementInGuestFrame,
    isElementVisibleInGuestFrame,
    animateScrollToElementInGuestFrame,
    getGuestFrameWindow
} from '@neos-project/neos-ui-guest-frame/src/dom';
import {neos} from '@neos-project/neos-ui-decorators';
import {selectors} from '@neos-project/neos-ui-redux-store';
import {IconButton, Icon, Button} from "@neos-project/react-ui-components";

import style from './style.module.css';
import {InsertPosition} from "@neos-project/neos-ts-interfaces";

/**
 * Format node label by replacing html entities and trimming to max length
 * @param node
 * @param {number} maxLength
 * @return {string}
 */
const formatNodeLabel = (node, maxLength = 20) => {
    let nodeLabel = node.label;

    // Replace html special characters, unmatched entities are replaced with a space
    const htmlEntities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'",
        '&ndash;': '-',
    };
    nodeLabel = nodeLabel.replace(/&[\w#]+;/g, (entity) => {
        return htmlEntities[entity] || ' ';
    });

    // Trim to max length characters
    return nodeLabel.substring(0, maxLength) + (nodeLabel.length > maxLength ? '…' : '');
}

@neos(globalRegistry => ({
    nodeTypesRegistry: globalRegistry.get('@neos-project/neos-ui-contentrepository'),
    i18nRegistry: globalRegistry.get('i18n'),
    guestFrameRegistry: globalRegistry.get('@neos-project/neos-ui-guest-frame'),
    inlineEditorRegistry: globalRegistry.get('inlineEditors'),
}))
@connect(state => ({
    currentlyEditedPropertyName: selectors.UI.ContentCanvas.currentlyEditedPropertyName(state),
    focusedNodeTypeName: selectors.CR.Nodes.focusedNodeTypeSelector(state),
    focusedNode: selectors.CR.Nodes.focusedSelector(state),
}))
export default class NodeToolbar extends PureComponent {
    static propTypes = {
        contextPath: PropTypes.string,
        fusionPath: PropTypes.string,
        destructiveOperationsAreDisabled: PropTypes.bool.isRequired,
        // Flag triggered by content tree that tells inlineUI that it should scroll into view
        shouldScrollIntoView: PropTypes.bool.isRequired,
        isCut: PropTypes.bool.isRequired,
        isCopied: PropTypes.bool.isRequired,
        canBeDeleted: PropTypes.bool.isRequired,
        canBeEdited: PropTypes.bool.isRequired,
        visibilityCanBeToggled: PropTypes.bool.isRequired,
        // Unsets the flag
        requestScrollIntoView: PropTypes.func.isRequired,
        i18nRegistry: PropTypes.object.isRequired,
        guestFrameRegistry: PropTypes.object.isRequired,
        visible: PropTypes.bool,
        currentlyEditedPropertyName: PropTypes.string,
        inlineEditorRegistry: PropTypes.object.isRequired,
        focusedNodeTypeName: PropTypes.string,
        focusedNode: PropTypes.object,
        nodeTypesRegistry: PropTypes.object.isRequired
    };

    state = {
        isSticky: false,
        cursorOffsetY: 0
    };

    iframeWindow = getGuestFrameWindow();

    // Track mouse position for toolbar positioning
    handleMouseMove = (event) => {
        this.setState({
            cursorOffsetY: event.pageY
        });
    };

    updateStickyness = () => {
        const nodeElement = findNodeInGuestFrame(this.props.contextPath, this.props.fusionPath);
        if (nodeElement) {
            const {isSticky} = this.state;
            const {top, bottom} = nodeElement.getBoundingClientRect();
            const shouldBeSticky = top < 50 && bottom > 0;

            if (isSticky !== shouldBeSticky) {
                this.setState({isSticky: shouldBeSticky});
            }
        }
    };

    debouncedSticky = debounce(this.updateStickyness, 5);

    debouncedUpdate = debounce(() => this.forceUpdate(), 5);

    componentDidMount() {
        this.iframeWindow.addEventListener('resize', this.debouncedUpdate);
        this.iframeWindow.addEventListener('scroll', this.debouncedSticky);
        this.iframeWindow.addEventListener('load', this.debouncedUpdate);
        this.iframeWindow.addEventListener('mousemove', this.handleMouseMove);

        this.scrollIntoView();
        this.updateStickyness();
    }

    componentDidUpdate() {
        this.scrollIntoView();
        this.updateStickyness();
    }

    componentWillUnmount() {
        this.iframeWindow.removeEventListener('resize', this.debouncedUpdate);
        this.iframeWindow.removeEventListener('scroll', this.debouncedSticky);
        this.iframeWindow.removeEventListener('load', this.debouncedUpdate);
        this.iframeWindow.removeEventListener('mousemove', this.handleMouseMove);

        if (this.debouncedUpdate && this.debouncedUpdate.cancel) {
            this.debouncedUpdate.cancel();
        }

        if (this.debouncedSticky && this.debouncedSticky.cancel) {
            this.debouncedSticky.cancel();
        }
    }

    scrollIntoView() {
        // Only scroll into view when triggered from content tree (on focus change)
        if (this.props.shouldScrollIntoView) {
            const nodeElement = findNodeInGuestFrame(this.props.contextPath, this.props.fusionPath);
            if (nodeElement && !isElementVisibleInGuestFrame(nodeElement)) {
                animateScrollToElementInGuestFrame(nodeElement, 100);
            }
            this.props.requestScrollIntoView(false);
        }
    }

    getToolbarComponent() {
        const {
            currentlyEditedPropertyName,
            hasFocusedContentNode,
            inlineEditorRegistry,
            focusedNodeTypeName
        } = this.props;

        // Focused node is not yet in state, we need to wait a bit
        if (!focusedNodeTypeName) {
            return () => null;
        }

        if (!hasFocusedContentNode && !currentlyEditedPropertyName) {
            return null;
        }

        const {ToolbarComponent} = inlineEditorRegistry.get('ckeditor5');

        return ToolbarComponent || null;
    }

    render() {
        const {
            contextPath,
            fusionPath,
            focusedNode,
            destructiveOperationsAreDisabled,
            isCut,
            isCopied,
            canBeDeleted,
            canBeEdited,
            visibilityCanBeToggled,
            i18nRegistry,
            guestFrameRegistry,
            nodeTypesRegistry,
            visible,
        } = this.props;

        if (!contextPath) {
            return null;
        }

        const nodeElement = findNodeInGuestFrame(contextPath, fusionPath);

        // Check if nodeElement exists before accessing its props or if the node toolbar
        // should be invisible e.g. when the workspace is in read only mode
        if (!nodeElement || !visible) {
            return null;
        }

        const anchorPosition = getAbsolutePositionOfElementInGuestFrame(nodeElement);
        const {cursorOffsetY, isSticky} = this.state;

        // Calculate the position of the structural toolbar based on the cursor position and the nodetypes role
        const focusedNodeType = nodeTypesRegistry.get(focusedNode.nodeType);
        const isContentCollection = nodeTypesRegistry.hasRole(focusedNode.nodeType, 'contentCollection');
        let insertPosition = cursorOffsetY >= (anchorPosition.top + anchorPosition.height / 2) ? InsertPosition.AFTER : InsertPosition.BEFORE;
        if (isContentCollection && cursorOffsetY >= (anchorPosition.top + 5)
            && cursorOffsetY <= (anchorPosition.top + anchorPosition.height - 5)) {
            insertPosition = InsertPosition.INTO;
        }

        const nodeToolbarClassNames = mergeClassNames({
            [style.toolBar__popover]: true,
            [style['toolBar__popover--isSticky']]: isSticky
        });
        const structuralToolbarClassNames = mergeClassNames({
            [style.structuralToolBar__popover]: true,
            [style['structuralToolBar__popover--isInside']]: insertPosition === InsertPosition.INTO,
            [style['structuralToolBar__popover--isBelow']]: insertPosition === InsertPosition.AFTER,
        });

        const NodeToolbarButtons = guestFrameRegistry.getChildren('NodeToolbar/Buttons');
        const NodeToolbarSecondaryButtons = guestFrameRegistry.getChildren('NodeToolbar/SecondaryButtons');
        const InlineEditorToolbar = this.getToolbarComponent();

        const focusedNodeLabel = focusedNode.label.substring(0, 20) + (focusedNode.label.length > 20 ? '…' : '');
        const focusedNodeTypeIcon = focusedNodeType?.icon || 'cube';

        const props = {
            i18nRegistry,
            contextPath,
            fusionPath,
            destructiveOperationsAreDisabled,
            canBeDeleted,
            canBeEdited,
            isCopied,
            isCut,
            visibilityCanBeToggled,
            insertPosition,
            className: style.toolBar__btnGroup__btn
        };

        // The data attribute data-ignore_click_outside is used to disable the enhanceWithClickOutside
        // handling. For the special case that the outOfBandRender returns an empty rendered content
        // we need to disable the enhanceWithClickOutside handling to prevent hick ups in the event
        // registration after guest frame reload.
        return (
            <>
                <div
                    className={style.toolBar__anchor}
                    id="inline-ui-node-anchor"
                    popovertarget="inline-ui-toolbar-popover"
                    style={anchorPosition}
                ></div>
                <div className={structuralToolbarClassNames}>
                    <div className={style.toolBar} data-ignore_click_outside="true">
                        <div className={style.toolBar__btnGroup}>
                            {NodeToolbarButtons.map((Item, key) => <Item key={key} {...props} />)}
                        </div>
                    </div>
                </div>
                <div className={nodeToolbarClassNames} id="inline-ui-toolbar-popover">
                    <div className={style.toolBar} data-ignore_click_outside="true">
                        <span className={style.toolBar__nodeLabel}>
                            <Icon icon={focusedNodeTypeIcon} />
                            {focusedNodeLabel}
                        </span>
                        {/*{InlineEditorToolbar && <InlineEditorToolbar />}*/}
                        <div className={style.toolBar__contextMenuToggleWrapper}>
                            <IconButton
                                className={style.toolBar__contextMenuToggle}
                                popovertarget="inline-ui-toolbar-context-menu"
                                icon="ellipsis-vertical"
                                onClick={void 0}
                                hoverStyle="brand"
                                size="small"
                                title={i18nRegistry.translate('toggleContextMenu', 'Toggle context menu')}
                            />
                            <div
                                id="inline-ui-toolbar-context-menu"
                                className={style.toolBar__contextMenu}
                                popover="auto"
                            >
                                <div className={style.toolBar__btnGroupVertical}>
                                    {NodeToolbarSecondaryButtons.map((Item, key) => <Item key={key} {...props} />)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
