import {actionTypes as system, InitAction} from '../../System';
import {GlobalState} from '../..';

//
// Export the subreducer state shape interface
//
export type State = boolean;

export const defaultState: State = false;

//
// Export the action types
//
export enum actionTypes {
    DISMISS = '@neos/neos-ui/UI/PreviewModeHint/DISMISS'
}

//
// Export the actions
//
export const actions = {
    dismiss: () => ({type: actionTypes.DISMISS})
};

//
// Export the reducer
//
export const reducer = (state: State = defaultState, action: InitAction | {type: actionTypes}): State => {
    switch (action.type) {
        case system.INIT:
            return Boolean((action as InitAction).payload.ui.previewModeHintDismissed);
        case actionTypes.DISMISS:
            return true;
        default:
            return state;
    }
};

//
// Export the selectors
//
export const selectors = {
    isDismissed: (state: GlobalState) => state?.ui?.previewModeHintDismissed
};
