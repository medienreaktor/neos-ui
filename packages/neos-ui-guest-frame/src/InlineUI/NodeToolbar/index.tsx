import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
// @ts-ignore
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
// @ts-ignore
import debounce from 'lodash.debounce';

import {
    animateScrollToElementInGuestFrame,
    findNodeInGuestFrame,
    getAbsolutePositionOfElementInGuestFrame,
    getGuestFrameWindow,
    isElementVisibleInGuestFrame
} from '@neos-project/neos-ui-guest-frame/src/dom';
import {neos} from '@neos-project/neos-ui-decorators';
import {selectors} from '@neos-project/neos-ui-redux-store';
import {InsertPosition, NodeTypesRegistry} from "@neos-project/neos-ts-interfaces";

import StructuralToolbar from './StructuralToolbar';
import ContextToolbar from './ContextToolbar';

import style from './style.module.css';
import {GlobalState} from "@neos-project/neos-ui-redux-store/src/System";

type NodeToolbarProps = {
    canBeDeleted: boolean;
    canBeEdited: boolean;
    contextPath?: string;
    destructiveOperationsAreDisabled: boolean;
    focusedNode?: {nodeType: string};
    fusionPath?: string;
    i18nRegistry: any;
    isCopied: boolean;
    isCut: boolean;
    nodeTypesRegistry: NodeTypesRegistry;
    requestScrollIntoView: (value: boolean) => void;
    shouldScrollIntoView: boolean;
    visibilityCanBeToggled: boolean;
    visible?: boolean;
}

const NodeToolbar: React.FC<NodeToolbarProps> = ({
    canBeDeleted,
    canBeEdited,
    contextPath,
    destructiveOperationsAreDisabled,
    focusedNode,
    fusionPath,
    i18nRegistry,
    isCopied,
    isCut,
    nodeTypesRegistry,
    requestScrollIntoView,
    shouldScrollIntoView,
    visibilityCanBeToggled,
    visible,
}) => {
    const [insertPosition, setInsertPosition] = useState<InsertPosition>(InsertPosition.AFTER);
    const [anchorPosition, setAnchorPosition] = useState<{top: number, left: number, height: number, right: number, width: number}|null>(null);

    const iframeWindow = useRef(getGuestFrameWindow()).current;
    const debouncedUpdateRef = useRef();

    const isContentCollection = useMemo(() => {
        return focusedNode ? nodeTypesRegistry.hasRole(focusedNode.nodeType, 'contentCollection') : false
    }, [focusedNode, nodeTypesRegistry]);

    // Track mouse position for toolbar positioning
    const handleMouseMove = useCallback((event: MouseEvent) => {
        // Round offset to the closest divisible value to avoid too many state updates
        const cursorOffsetY = Math.round(event.pageY / 10) * 10;

        if (!focusedNode || !anchorPosition) {
            setInsertPosition(InsertPosition.AFTER);
            return;
        }

        const activeRange = Math.max(Math.round(anchorPosition.height / 5), 20);

        if (isContentCollection && cursorOffsetY >= (anchorPosition.top + activeRange) && cursorOffsetY <= (anchorPosition.top + anchorPosition.height - activeRange)) {
            setInsertPosition(InsertPosition.INTO);
        }
        else if (cursorOffsetY >= anchorPosition.top + anchorPosition.height - activeRange) {
            setInsertPosition(InsertPosition.AFTER);
        }
        else if (cursorOffsetY <= anchorPosition.top + activeRange) {
            setInsertPosition(InsertPosition.BEFORE);
        }
    }, [focusedNode, anchorPosition, nodeTypesRegistry, isContentCollection]);

    const updateAnchorPosition = useCallback(() => {
        if (!visible) {
            return;
        }

        const nodeElement = findNodeInGuestFrame(contextPath, fusionPath);
        if (!nodeElement) {
            return;
        }

        const newAnchorPosition = getAbsolutePositionOfElementInGuestFrame(nodeElement);
        setAnchorPosition(prevAnchorPosition => {
            if (prevAnchorPosition
                && prevAnchorPosition.top === newAnchorPosition.top
                && prevAnchorPosition.left === newAnchorPosition.left
                && prevAnchorPosition.width === newAnchorPosition.width
                && prevAnchorPosition.height === newAnchorPosition.height) {
                return prevAnchorPosition;
            }
            return newAnchorPosition;
        });
    }, [contextPath, fusionPath, visible]);

    const forceUpdate = useCallback(() => {
        // Force re-render by updating a dummy state if needed
        // In most cases, the dependencies should handle updates automatically
    }, []);

    const scrollIntoView = useCallback(() => {
        // Only scroll into view when triggered from content tree (on focus change)
        if (shouldScrollIntoView) {
            const nodeElement = findNodeInGuestFrame(contextPath, fusionPath);
            if (nodeElement && !isElementVisibleInGuestFrame(nodeElement)) {
                animateScrollToElementInGuestFrame(nodeElement, 100);
            }
            requestScrollIntoView(false);
        }
    }, [shouldScrollIntoView, contextPath, fusionPath, requestScrollIntoView]);

    const toolbarButtonProps = useMemo(() => {
        return {
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
    }, [i18nRegistry, contextPath, fusionPath, destructiveOperationsAreDisabled, canBeDeleted, canBeEdited, isCopied, isCut, visibilityCanBeToggled, insertPosition]);

    // Initialize debounced functions
    useEffect(() => {
        debouncedUpdateRef.current = debounce(forceUpdate, 5);

        return () => {
            if (debouncedUpdateRef.current?.cancel) {
                debouncedUpdateRef.current.cancel();
            }
        };
    }, [forceUpdate]);

    useEffect(() => {
        if (!iframeWindow) return;

        iframeWindow.addEventListener('resize', debouncedUpdateRef.current);
        iframeWindow.addEventListener('load', debouncedUpdateRef.current);
        iframeWindow.addEventListener('mousemove', handleMouseMove);

        scrollIntoView();
        updateAnchorPosition();

        return () => {
            iframeWindow.removeEventListener('resize', debouncedUpdateRef.current);
            iframeWindow.removeEventListener('load', debouncedUpdateRef.current);
            iframeWindow.removeEventListener('mousemove', handleMouseMove);
        };
    }, [handleMouseMove, scrollIntoView, updateAnchorPosition]);

    // Update effect - equivalent to componentDidUpdate
    useEffect(() => {
        scrollIntoView();
        updateAnchorPosition();
    }, [scrollIntoView, updateAnchorPosition]);

    if (!contextPath || !visible || !anchorPosition) {
        return null;
    }

    // TODO: Move check for node into events instead of doing it on every render
    const nodeElement = findNodeInGuestFrame(contextPath, fusionPath);
    if (!nodeElement) {
        return null;
    }

    return (
        <>
            <div
                className={style.toolBar__anchor}
                id="inline-ui-node-anchor"
                popovertarget="inline-ui-toolbar-popover"
                style={anchorPosition}
            ></div>
            <ContextToolbar buttonProps={toolbarButtonProps} contextPath={contextPath} fusionPath={fusionPath}/>
            <StructuralToolbar insertPosition={insertPosition} buttonProps={toolbarButtonProps}/>
        </>
    );
};

NodeToolbar.propTypes = {
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
    visible: PropTypes.bool,
    focusedNode: PropTypes.object,
    nodeTypesRegistry: PropTypes.object.isRequired
};

const ConnectedNodeToolbar = connect((state: GlobalState) => ({
    focusedNode: selectors.CR.Nodes.focusedSelector(state),
}))(React.memo(NodeToolbar));

export default neos(globalRegistry => ({
    nodeTypesRegistry: globalRegistry.get('@neos-project/neos-ui-contentrepository'),
    i18nRegistry: globalRegistry.get('i18n'),
}))(ConnectedNodeToolbar);
