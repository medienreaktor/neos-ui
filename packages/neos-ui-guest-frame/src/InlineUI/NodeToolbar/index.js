import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
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

import style from './style.module.css';
import {InsertPosition} from "@neos-project/neos-ts-interfaces";
import StructuralToolbar from "./StructuralToolbar";
import ContextToolbar from "./ContextToolbar";

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
        const {cursorOffsetY} = this.state;
        // Round offset to the closest divisible value to avoid too many state updates
        const newCursorOffsetY = Math.round(event.pageY / 10) * 10;
        if (newCursorOffsetY === cursorOffsetY) {
            console.debug('Skipping mouse move update');
            return;
        }
        this.setState({cursorOffsetY: newCursorOffsetY});
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

    updateAnchorPosition = () => {
        const {contextPath, fusionPath, visible} = this.props;

        if (!visible) {
            return;
        }

        const nodeElement = findNodeInGuestFrame(contextPath, fusionPath);
        if (!nodeElement) {
            return;
        }

        const newAnchorPosition = getAbsolutePositionOfElementInGuestFrame(nodeElement);
        const {anchorPosition} = this.state;
        if (anchorPosition
            && anchorPosition.top === newAnchorPosition.top
            && anchorPosition.left === newAnchorPosition.left
            && anchorPosition.width === newAnchorPosition.width
            && anchorPosition.height === newAnchorPosition.height) {
            return;
        }
        this.setState({anchorPosition: newAnchorPosition});
    }

    debouncedSticky = debounce(this.updateStickyness, 5);

    debouncedUpdate = debounce(() => this.forceUpdate(), 5);

    componentDidMount() {
        this.iframeWindow.addEventListener('resize', this.debouncedUpdate);
        this.iframeWindow.addEventListener('scroll', this.debouncedSticky);
        this.iframeWindow.addEventListener('load', this.debouncedUpdate);
        this.iframeWindow.addEventListener('mousemove', this.handleMouseMove);

        this.scrollIntoView();
        this.updateStickyness();
        this.updateAnchorPosition();
    }

    componentDidUpdate() {
        this.scrollIntoView();
        this.updateStickyness();
        this.updateAnchorPosition();
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

        if (!contextPath || !visible) {
            return null;
        }

        // TODO: Move check for node into events instead of doing it on every render
        const nodeElement = findNodeInGuestFrame(contextPath, fusionPath);
        if (!nodeElement) {
            return null;
        }

        const {cursorOffsetY, isSticky, anchorPosition} = this.state;

        if (!anchorPosition) {
            return null;
        }

        // Calculate the position of the structural toolbar based on the cursor position and the nodetypes role
        const focusedNodeType = nodeTypesRegistry.get(focusedNode.nodeType);
        const isContentCollection = nodeTypesRegistry.hasRole(focusedNode.nodeType, 'contentCollection');
        let insertPosition = cursorOffsetY >= (anchorPosition.top + anchorPosition.height / 2) ? InsertPosition.AFTER : InsertPosition.BEFORE;
        if (isContentCollection && cursorOffsetY >= (anchorPosition.top + 5)
            && cursorOffsetY <= (anchorPosition.top + anchorPosition.height - 5)) {
            insertPosition = InsertPosition.INTO;
        }

        const NodeToolbarButtons = guestFrameRegistry.getChildren('NodeToolbar/Buttons');
        const NodeToolbarSecondaryButtons = guestFrameRegistry.getChildren('NodeToolbar/SecondaryButtons');

        const toolbarButtonProps = {
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

        // TODO: Check: The data attribute data-ignore_click_outside is used to disable the enhanceWithClickOutside
        // handling. For the special case that the outOfBandRender returns an empty rendered content
        // we need to disable the enhanceWithClickOutside handling to prevent hick ups in the event
        // registration after guest frame reload.

        // TODO: Try to solve the sticky toolbar with a second anchor instead of the scroll event
        // TODO: Get toolbars from a registry and make them standalone components
        return (
            <>
                <div
                    className={style.toolBar__anchor}
                    id="inline-ui-node-anchor"
                    popovertarget="inline-ui-toolbar-popover"
                    style={anchorPosition}
                ></div>
                <ContextToolbar
                    focusedNode={focusedNode}
                    focusedNodeType={focusedNodeType}
                    isSticky={isSticky}
                    buttons={NodeToolbarSecondaryButtons}
                    buttonProps={toolbarButtonProps}
                />
                <StructuralToolbar
                    insertPosition={insertPosition}
                    buttons={NodeToolbarButtons}
                    buttonProps={toolbarButtonProps}
                />
            </>
        );
    }
}
