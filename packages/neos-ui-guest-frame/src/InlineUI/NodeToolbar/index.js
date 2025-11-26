import React, {PureComponent} from 'react';
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
import style from './style.module.css';

@neos(globalRegistry => ({
    nodeTypesRegistry: globalRegistry.get('@neos-project/neos-ui-contentrepository'),
    i18nRegistry: globalRegistry.get('i18n'),
    guestFrameRegistry: globalRegistry.get('@neos-project/neos-ui-guest-frame')
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
        visible: PropTypes.bool
    };

    state = {
        isSticky: false,
        toolbarPosition: {}
    };

    iframeWindow = getGuestFrameWindow();

    prevNodeToolbarRef = null;

    resizeObserver = null;

    nodeToolbarRef = React.createRef();

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

    updateToolbarPosition = () => {
        const {contextPath, fusionPath, visible} = this.props;

        if (!this.nodeToolbarRef.current || !visible) {
            return;
        }

        const nodeElement = findNodeInGuestFrame(contextPath, fusionPath);
        if (!nodeElement) {
            return;
        }

        const {
            top,
            left,
            width,
            rightAsMeasuredFromRightDocumentBorder
        } = getAbsolutePositionOfElementInGuestFrame(nodeElement);

        const toolbarWidth = this.nodeToolbarRef.current.offsetWidth;
        const toolbarHeight = this.nodeToolbarRef.current.offsetHeight;

        // Only proceed if we have valid dimensions
        if (toolbarWidth === 0 || toolbarHeight === 0) {
            return;
        }

        const toolbarPosition = {
            top: top - toolbarHeight - 10,
            left: width < toolbarWidth ? left : 'auto',
            right: width >= toolbarWidth ? rightAsMeasuredFromRightDocumentBorder : 'auto'
        };

        this.setState({toolbarPosition});
    };

    setupResizeObserver = () => {
        if (this.nodeToolbarRef.current && window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver(() => {
                // Debounce the position update to avoid excessive calculations
                if (this.debouncedPositionUpdate) {
                    this.debouncedPositionUpdate();
                }
            });
            this.resizeObserver.observe(this.nodeToolbarRef.current);
            this.resizeObserver.observe(getGuestFrameWindow().document.body);
            const nodeElement = findNodeInGuestFrame(this.props.contextPath, this.props.fusionPath);
            if (nodeElement) {
                this.resizeObserver.observe(nodeElement);
            }
        }
    };

    cleanupResizeObserver = () => {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
    };

    debouncedSticky = debounce(this.updateStickyness, 5);

    debouncedUpdate = debounce(() => this.forceUpdate(), 5);

    debouncedPositionUpdate = debounce(this.updateToolbarPosition, 10);

    componentDidMount() {
        this.prevNodeToolbarRef = this.nodeToolbarRef.current;

        this.iframeWindow.addEventListener('resize', this.debouncedUpdate);
        this.iframeWindow.addEventListener('scroll', this.debouncedSticky);
        this.iframeWindow.addEventListener('load', this.debouncedUpdate);

        this.scrollIntoView();
        this.updateStickyness();
        this.setupResizeObserver();
    }

    componentDidUpdate(prevProps, prevState) {
        const {contextPath, fusionPath, visible} = this.props;
        this.scrollIntoView();
        this.updateStickyness();

        if (prevProps.contextPath !== contextPath
            || prevProps.fusionPath !== fusionPath
            || prevProps.visible !== visible
            || this.prevNodeToolbarRef !== this.nodeToolbarRef.current
        ) {
            // Clean up previous observer if toolbar ref changed
            if (this.prevNodeToolbarRef !== this.nodeToolbarRef.current) {
                this.cleanupResizeObserver();
            }

            // Set up new observer and update position
            if (this.nodeToolbarRef.current) {
                this.setupResizeObserver();
                // Use setTimeout to ensure the toolbar content has been rendered before measuring
                setTimeout(() => this.updateToolbarPosition(), 0);
            }
        }

        this.prevNodeToolbarRef = this.nodeToolbarRef.current;
    }

    componentWillUnmount() {
        this.iframeWindow.removeEventListener('resize', this.debouncedUpdate);
        this.iframeWindow.removeEventListener('scroll', this.debouncedSticky);
        this.iframeWindow.removeEventListener('load', this.debouncedUpdate);
        this.cleanupResizeObserver();

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
            destructiveOperationsAreDisabled,
            isCut,
            isCopied,
            canBeDeleted,
            canBeEdited,
            visibilityCanBeToggled,
            i18nRegistry,
            guestFrameRegistry
        } = this.props;

        if (!contextPath) {
            return null;
        }

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
            className: style.toolBar__btnGroup__btn
        };

        const {isSticky, toolbarPosition} = this.state;
        const classNames = mergeClassNames({
            [style.toolBar]: true,
            [style['toolBar--isSticky']]: isSticky
        });

        const NodeToolbarButtons = guestFrameRegistry.getChildren('NodeToolbar/Buttons');

        // The data attribute data-ignore_click_outside is used to disable the enhanceWithClickOutside
        // handling. For the special case that the outOfBandRender returns an empty rendered content
        // we need to disable the enhanceWithClickOutside handling to prevent hick ups in the event
        // registration after guest frame reload.
        return (
            <div className={classNames} data-ignore_click_outside="true" style={toolbarPosition}>
                <div className={style.toolBar__btnGroup} ref={this.nodeToolbarRef}>
                    {NodeToolbarButtons.map((Item, key) => <Item key={key} {...props} />)}
                </div>
            </div>
        );
    }
}
