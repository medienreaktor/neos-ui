import {call, takeEvery} from 'redux-saga/effects';
import {actionTypes} from '@neos-project/neos-ui-redux-store';

export function * reflectChangeInAddressBar(action) {
    yield call([history, history.replaceState], {}, '', `?node=${encodeURIComponent(action.payload.contextPath)}`);
}

export function * watchContentURIChange() {
    yield takeEvery(actionTypes.UI.ContentCanvas.SET_CONTEXT_PATH, reflectChangeInAddressBar);
}
