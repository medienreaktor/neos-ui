import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash.omit';
import ReactDOM from 'react-dom';

export default class Frame extends PureComponent {
    static propTypes = {
        src: PropTypes.string,
        mountTarget: PropTypes.string.isRequired,
        contentDidUpdate: PropTypes.func.isRequired,
        onLoad: PropTypes.func,
        onUnload: PropTypes.func,
        children: PropTypes.node
    };

    handleReference = ref => {
        this.ref = ref;
    };

    componentDidMount() {
        this.updateIframeUrlIfNecessary();
        this.addClickListener();
    }

    addClickListener() {
        if (this.ref) {
            this.ref.contentDocument.addEventListener('click', e => {
                this.relayClickEventToHostDocument(e);
            });
        }
    }

    removeClickListener() {
        if (this.ref) {
            this.ref.contentDocument.removeEventListener('click', this.relayClickEventToHostDocument);
        }
    }

    relayClickEventToHostDocument() {
        window.document.dispatchEvent(new MouseEvent('click'));
    }

    componentWillUpdate() {
        this.removeClickListener();
    }

    componentDidUpdate() {
        this.updateIframeUrlIfNecessary();
        this.addClickListener();
    }

    // We do not use react's magic to change to a different URL in the iFrame, but do it
    // explicitely (in order to avoid reloads if we are already on the correct page)
    updateIframeUrlIfNecessary() {
        if (!this.ref) {
            return;
        }

        try {
            const win = this.ref.contentWindow; // eslint-disable-line react/no-find-dom-node
            if (win.location.href !== this.props.src) {
                win.location = this.props.src;
            }
        } catch (err) {
            console.error(`Could not update iFrame Url from within. Trying to set src attribute manually...`);
            this.ref.setAttribute('src', this.props.src);
        }
    }

    render() {
        const rest = omit(this.props, [
            'mountTarget',
            'contentDidUpdate',
            'theme',
            'children',
            'onLoad',
            'onUnload',
            'src'
        ]);

        return <iframe ref={this.handleReference} onLoad={this.handleLoad} {...rest}/>;
    }

    componentWillMount() {
        document.addEventListener('Neos.Neos.Ui.ContentReady', this.renderFrameContents);
    }

    handleLoad = () => {
        const {onLoad} = this.props;

        if (typeof onLoad === 'function') {
            onLoad(this.ref);
        }
    }

    renderFrameContents = () => {
        const doc = ReactDOM.findDOMNode(this).contentDocument; // eslint-disable-line react/no-find-dom-node
        const win = ReactDOM.findDOMNode(this).contentWindow; // eslint-disable-line react/no-find-dom-node
        win.addEventListener('unload', this.props.onUnload);
        const mountTarget = doc.querySelector(this.props.mountTarget);
        const contents = React.createElement('div', undefined, this.props.children);
        const iframeHtml = doc.querySelector('html');

        // Center iframe
        iframeHtml.style.margin = '0 auto';

        ReactDOM.unstable_renderSubtreeIntoContainer(this, contents, mountTarget, () => {
            this.props.contentDidUpdate(win, doc, mountTarget);
        });
    }

    componentWillUnmount() {
        const doc = ReactDOM.findDOMNode(this).contentDocument; // eslint-disable-line react/no-find-dom-node
        document.removeEventListener('Neos.Neos.Ui.ContentReady', this.renderFrameContents);
        if (doc) {
            ReactDOM.unmountComponentAtNode(doc.body);
        }
        this.removeClickListener();
    }
}
