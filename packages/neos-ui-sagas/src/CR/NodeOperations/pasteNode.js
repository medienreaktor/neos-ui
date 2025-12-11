import {call, put, select, takeEvery} from 'redux-saga/effects';

import {actions, actionTypes, selectors} from '@neos-project/neos-ui-redux-store';

import determineInsertMode from './determineInsertMode';
import {calculateChangeTypeFromMode, calculateDomAddressesFromMode} from './helpers';
import {InsertPosition} from '@neos-project/neos-ts-interfaces';

export default function * pasteNode({globalRegistry}) {
    const nodeTypesRegistry = globalRegistry.get('@neos-project/neos-ui-contentrepository');
    const canBeInsertedAlongsideSelector = selectors.CR.Nodes.makeCanBeCopiedAlongsideSelector(nodeTypesRegistry);
    const canBeInsertedIntoSelector = selectors.CR.Nodes.makeCanBeCopiedIntoSelector(nodeTypesRegistry);

    yield takeEvery(actionTypes.CR.Nodes.PASTE, function * waitForPaste(action) {
        const subject = yield select(selectors.CR.Nodes.clipboardNodesContextPathsSelector);
        const clipboardMode = yield select(
            state => state?.cr?.nodes?.clipboardMode
        );

        const {contextPath: reference, fusionPath, position: insertMode} = action.payload;
        const state = yield select();
        const canBeInsertedAlongside = subject.every(contextPath => {
            return canBeInsertedAlongsideSelector(state, {subject: contextPath, reference});
        });
        const canBeInsertedInto = subject.every(contextPath => {
            return canBeInsertedIntoSelector(state, {subject: contextPath, reference});
        });

        let mode = insertMode;
        if (!mode || (mode === InsertPosition.INTO && !canBeInsertedInto)
            || ((mode === InsertPosition.BEFORE || mode === InsertPosition.AFTER)) && !canBeInsertedAlongside) {
            // eslint-disable-next-line require-atomic-updates
            mode = yield call(
                determineInsertMode,
                subject,
                reference,
                canBeInsertedAlongside,
                canBeInsertedInto,
                clipboardMode === 'Copy' ? actionTypes.CR.Nodes.COPY : actionTypes.CR.Nodes.CUT
            );
        }

        if (mode) {
            const referenceNodeSelector = selectors.CR.Nodes.makeGetNodeByContextPathSelector(reference);
            const referenceNode = yield select(referenceNodeSelector);
            const baseNodeType = yield select(
                state => state?.ui?.pageTree?.filterNodeType
            );

            yield put(actions.CR.Nodes.commitPaste(clipboardMode));
            const changes = subject.map(contextPath => ({
                type: calculateChangeTypeFromMode(mode, clipboardMode),
                subject: contextPath,
                payload: {
                    ...calculateDomAddressesFromMode(mode, referenceNode, fusionPath),
                    baseNodeType
                }
            }));
            yield put(actions.Changes.persistChanges(changes));
        }
    });
}
