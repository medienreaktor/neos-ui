import {$get} from 'plow-js';
import backend from '@neos-project/neos-ui-backend-connector';

//
// Clipboard middleware.
//
// Saves clipboard state to server side session storage on every action
// that matches the "clipboardActionsPatterns"
//
const clipboardMiddleware = ({getState}) => {
    let timer = null;
    const debounceLocalStorageTimeout = 100;
    const clipboardActionsPatterns = [
        '@neos/neos-ui/CR/Nodes/COPY',
        '@neos/neos-ui/CR/Nodes/CUT',
        '@neos/neos-ui/CR/Nodes/COMMIT_PASTE'
    ];

    return next => action => {
        const returnValue = next(action);

        const serverActionMatched = clipboardActionsPatterns
        .some(pattern => action.type === pattern);
        if (serverActionMatched) {
            clearTimeout(timer);
            timer = setTimeout(() => {
                const {copyNode, cutNode, clearClipboard} = backend.get().endpoints;
                const state = getState();
                if (action.type === '@neos/neos-ui/CR/Nodes/COMMIT_PASTE') {
                    if (action.payload === 'Move') {
                        clearClipboard();
                    }
                } else if ($get('cr.nodes.clipboardMode', state) === 'Copy') {
                    copyNode($get('cr.nodes.clipboard', state));
                } else if ($get('cr.nodes.clipboardMode', state) === 'Move') {
                    cutNode($get('cr.nodes.clipboard', state));
                }
                timer = null;
            }, debounceLocalStorageTimeout);
        }

        return returnValue;
    };
};

export default clipboardMiddleware;
