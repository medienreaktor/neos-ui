import {call, takeEvery} from 'redux-saga/effects';

import {actionTypes} from '@neos-project/neos-ui-redux-store';
import backend from '@neos-project/neos-ui-backend-connector';
import {showFlashMessage} from '@neos-project/neos-ui-error';
import {translate} from '@neos-project/neos-ui-i18n';

export function * impersonateRestore({routes}) {
    const {impersonateRestore} = backend.get().endpoints;

    yield takeEvery(actionTypes.User.Impersonate.RESTORE, function * restore(action) {
        const errorMessage = translate('Neos.Neos:Main:impersonate.error.restoreUser', 'Could not switch back to the original user.');

        try {
            const feedback = yield call(impersonateRestore, action.payload);
            const originUser = feedback?.origin?.accountIdentifier;
            const user = feedback?.impersonate?.accountIdentifier;
            const status = feedback?.status;

            const restoreMessage = translate('Neos.Neos:Main:impersonate.success.restoreUser', 'Switched back from {0} to the orginal user {1}.', {0: user, 1: originUser});

            if (status) {
                showFlashMessage({
                    id: 'restoreUserImpersonateUser',
                    severity: 'success',
                    message: restoreMessage
                });
            } else {
                showFlashMessage({
                    id: 'restoreUserImpersonateUser',
                    severity: 'error',
                    message: errorMessage
                });
            }

            window.location.href = routes?.core?.modules?.defaultModule;
        } catch (error) {
            showFlashMessage({
                id: 'restoreUserImpersonateUser',
                severity: 'error',
                message: errorMessage
            });
        }
    });
}
