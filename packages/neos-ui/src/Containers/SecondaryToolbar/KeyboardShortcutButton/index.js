import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import IconButton from '@neos-project/react-ui-components/src/IconButton/';
import {neos} from '@neos-project/neos-ui-decorators';
import {connect} from 'react-redux';
import {translate} from '@neos-project/neos-ui-i18n';

import {actions} from '@neos-project/neos-ui-redux-store';

@neos(globalRegistry => ({
    hotkeyRegistry: globalRegistry.get('hotkeys')
}))
@connect(
    state => ({isOpen: state?.ui?.keyboardShortcutModal?.isOpen}),
    {open: actions.UI.KeyboardShortcutModal.open}
)
export default class KeyboardShortcutButton extends PureComponent {
    static propTypes = {
        toggleFullScreen: PropTypes.func,
        hotkeyRegistry: PropTypes.object.isRequired
    };

    render() {
        const {open, hotkeyRegistry} = this.props;

        if (hotkeyRegistry._registry === null || hotkeyRegistry._registry.length === 0) {
            return null;
        }

        return (
            <IconButton
                icon="keyboard"
                aria-label={translate('Neos.Neos:Main:displayKeyboardShortcuts', 'Display Keyboard Shortcuts')}
                title={translate('Neos.Neos:Main:displayKeyboardShortcuts', 'Display Keyboard Shortcuts')}
                onClick={open}
                />
        );
    }
}
