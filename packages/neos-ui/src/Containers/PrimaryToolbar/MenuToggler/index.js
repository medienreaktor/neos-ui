import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import mergeClassNames from 'classnames';

import Button from '@neos-project/react-ui-components/src/Button/';
import {actions} from '@neos-project/neos-ui-redux-store';
import {translate} from '@neos-project/neos-ui-i18n';

import style from './style.module.css';

@connect(state => ({
    isMenuHidden: state?.ui?.drawer?.isHidden
}), {
    toggleDrawer: actions.UI.Drawer.toggle
})
export default class MenuToggler extends PureComponent {
    static propTypes = {
        className: PropTypes.string,
        isMenuHidden: PropTypes.bool.isRequired,
        toggleDrawer: PropTypes.func.isRequired
    };

    handleToggle = () => {
        const {toggleDrawer} = this.props;

        toggleDrawer();
    }

    render() {
        const {className, isMenuHidden} = this.props;
        const isMenuVisible = !isMenuHidden;
        const classNames = mergeClassNames({
            [style.menuToggler]: true,
            [style['menuToggler--isActive']]: isMenuVisible,
            [className]: className && className.length
        });

        //
        // ToDo: Replace the static 'Menu' aria-label with a label from the i18n service.
        //
        return (
            <Button
                id="neos-MenuToggler"
                className={classNames}
                style="clean"
                hoverStyle="clean"
                isFocused={isMenuVisible}
                onClick={this.handleToggle}
                title={translate('Neos.Neos:Main:toggleMenu', 'Toggle menu')}
                aria-label="Menu"
                aria-controls="navigation"
                aria-expanded={isMenuHidden ? 'false' : 'true'}
                >
                <div className={style.menuToggler__icon}/>
            </Button>
        );
    }
}
