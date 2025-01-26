import React from 'react';
import PropTypes from 'prop-types';

import {Icon} from '@neos-project/react-ui-components';
import {connect} from 'react-redux';
import {actions} from '@neos-project/neos-ui-redux-store';
import I18n, {translate} from '@neos-project/neos-ui-i18n';

import buttonTheme from './style.module.css';

@connect(
    state => ({
        originUser: state?.user?.impersonate?.origin
    }),
    {
        impersonateRestore: actions.User.Impersonate.restore
    }
)
export default class RestoreButtonItem extends React.PureComponent {
    static propTypes = {
        originUser: PropTypes.object,
        impersonateRestore: PropTypes.func.isRequired
    };

    render() {
        const {originUser, impersonateRestore} = this.props;
        const title = translate('Neos.Neos:Main:impersonate.title.restoreUserButton', 'Switch back to the orginal user account',);

        return (originUser ? (
            <li className={buttonTheme.dropDown__item}>
                <button
                    title={title}
                    onClick={
                        () => impersonateRestore()
                    }
                >
                    <Icon
                        icon="random"
                        aria-hidden="true"
                        className={buttonTheme.dropDown__itemIcon}
                    />
                    <I18n
                        id="impersonate.label.restoreUserButton"
                        sourceName="Main"
                        packageKey="Neos.Neos"
                        fallback={`Back to user "${originUser.fullName}"`}
                        params={{0: originUser.fullName}}
                    />
                </button>
            </li>
        ) : null);
    }
}
