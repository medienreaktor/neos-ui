import {createAction} from 'redux-actions';
import {Map} from 'immutable';
import {$all, $set, $drop, $get, $merge} from 'plow-js';

import {handleActions} from '@neos-project/utils-redux';
import {actionTypes as system} from '../../System/index';

import * as selectors from './selectors';
import {parentNodeContextPath} from './helpers';
import {fromJSOrdered} from '@neos-project/utils-helpers';

const ADD = '@neos/neos-ui/CR/Nodes/ADD';
const MERGE = '@neos/neos-ui/CR/Nodes/MERGE';
const FOCUS = '@neos/neos-ui/CR/Nodes/FOCUS';
const UNFOCUS = '@neos/neos-ui/CR/Nodes/UNFOCUS';
const COMMENCE_CREATION = '@neos/neos-ui/CR/Nodes/COMMENCE_CREATION';
const COMMENCE_REMOVAL = '@neos/neos-ui/CR/Nodes/COMMENCE_REMOVAL';
const REMOVAL_ABORTED = '@neos/neos-ui/CR/Nodes/REMOVAL_ABORTED';
const REMOVAL_CONFIRMED = '@neos/neos-ui/CR/Nodes/REMOVAL_CONFIRMED';
const REMOVE = '@neos/neos-ui/CR/Nodes/REMOVE';
const SET_STATE = '@neos/neos-ui/CR/Nodes/SET_STATE';
const RELOAD_STATE = '@neos/neos-ui/CR/Nodes/RELOAD_STATE';
const COPY = '@neos/neos-ui/CR/Nodes/COPY';
const CUT = '@neos/neos-ui/CR/Nodes/CUT';
const MOVE = '@neos/neos-ui/CR/Nodes/MOVE';
const PASTE = '@neos/neos-ui/CR/Nodes/PASTE';
const COMMIT_PASTE = '@neos/neos-ui/CR/Nodes/COMMIT_PASTE';
const HIDE = '@neos/neos-ui/CR/Nodes/HIDE';
const SHOW = '@neos/neos-ui/CR/Nodes/SHOW';
const UPDATE_URI = '@neos/neos-ui/CR/Nodes/UPDATE_URI';

//
// Export the action types
//
export const actionTypes = {
    ADD,
    MERGE,
    FOCUS,
    UNFOCUS,
    COMMENCE_CREATION,
    COMMENCE_REMOVAL,
    REMOVAL_ABORTED,
    REMOVAL_CONFIRMED,
    REMOVE,
    SET_STATE,
    RELOAD_STATE,
    COPY,
    CUT,
    MOVE,
    PASTE,
    COMMIT_PASTE,
    HIDE,
    SHOW,
    UPDATE_URI
};

/**
 * Adds nodes to the application state. Completely *replaces*
 * the nodes from the application state with the passed nodes.
 *
 * @param {Object} nodeMap A map of nodes, with contextPaths as key
 */
const add = createAction(ADD, nodeMap => ({nodeMap}));

/**
 * Adds/Merges nodes to the application state. *Merges*
 * the nodes from the application state with the passed nodes.
 *
 * @param {Object} nodeMap A map of nodes, with contextPaths as key
 */
const merge = createAction(MERGE, nodeMap => ({nodeMap}));

/**
 * Marks a node as focused
 *
 * @param {String} contextPath The context path of the focused node
 * @param {String} fusionPath The fusion path of the focused node, needed for out-of-band-rendering, e.g. when
 *                            adding new nodes
 */
const focus = createAction(FOCUS, (contextPath, fusionPath) => ({contextPath, fusionPath}));

/**
 * Un-marks all nodes as not focused.
 */
const unFocus = createAction(UNFOCUS);

/**
 * Start node removal workflow
 *
 * @param {String} contextPath The context path of the node to be removed
 */
const commenceRemoval = createAction(COMMENCE_REMOVAL, contextPath => contextPath);

/**
 * Start node creation workflow
 *
 * @param {String} referenceNodeContextPath The context path of the referenceNode
 * @param {String} referenceNodeFusionPath (optional) The fusion path of the referenceNode
 * @param {String} preferredMode (optional) The default mode to use in the nodetype selection dialog. Currently not used withing the system but may be useful for extensibility.
 * @param {String} nodeType (optional) If set, then the select nodetype step would be skipped completely. Currently not used withing the system but may be useful for extensibility.
 */
const commenceCreation = createAction(COMMENCE_CREATION, (referenceNodeContextPath, referenceNodeFusionPath, preferredMode = 'after', nodeType = null) => ({
    referenceNodeContextPath,
    referenceNodeFusionPath,
    preferredMode,
    nodeType
}));

/**
 * Abort the ongoing node removal workflow
 */
const abortRemoval = createAction(REMOVAL_ABORTED);

/**
 * Confirm the ongoing removal
 */
const confirmRemoval = createAction(REMOVAL_CONFIRMED);

/**
 * Remove the node that was marked for removal
 *
 * @param {String} contextPath The context path of the node to be removed
 */
const remove = createAction(REMOVE, contextPath => contextPath);

/**
 * Set CR state on page load or after dimensions or workspaces switch
 */
const setState = createAction(
    SET_STATE,
    ({siteNodeContextPath, documentNodeContextPath, nodes, merge}) => ({
        siteNodeContextPath,
        documentNodeContextPath,
        nodes,
        merge
    })
);

/**
 * Reload CR nodes state
 */
const reloadState = createAction(RELOAD_STATE, args => args);

/**
 * Mark a node for copy on paste
 *
 * @param {String} contextPath The context path of the node to be copied
 */
const copy = createAction(COPY, contextPath => contextPath);

/**
 * Mark a node for cut on paste
 *
 * @param {String} contextPath The context path of the node to be cut
 */
const cut = createAction(CUT, contextPath => contextPath);

/**
 * Move a node
 *
 * @param {String} nodeToBeMoved The context path of the node to be moved
 * @param {String} targetNode The context path of the target node
 * @param {String} position "into", "before" or "after"
 */
const move = createAction(MOVE, (nodeToBeMoved, targetNode, position) => ({nodeToBeMoved, targetNode, position}));

/**
 * Paste the contents of the node clipboard
 *
 * @param {String} contextPath The context path of the target node
 * @param {String} fusionPath The fusion path of the target node, needed for out-of-band-rendering
 */
const paste = createAction(PASTE, (contextPath, fusionPath) => ({contextPath, fusionPath}));

/**
 * Marks the moment when the actual paste request is commited
 *
 */
const commitPaste = createAction(COMMIT_PASTE, clipboardMode => clipboardMode);

/**
 * Hide the given node
 *
 * @param {String} contextPath The context path of the node to be hidden
 */
const hide = createAction(HIDE, contextPath => contextPath);

/**
 * Show the given node
 *
 * @param {String} contextPath The context path of the node to be shown
 */
const show = createAction(SHOW, contextPath => contextPath);

/**
 * Update uris of all affected nodes after uriPathSegment of a node has changed
 * Must update the node itself and all of its descendants
 *
 * @param {String} oldUriFragment
 * @param {String} newUriFragment
 */
const updateUri = createAction(UPDATE_URI, (oldUriFragment, newUriFragment) => ({oldUriFragment, newUriFragment}));

//
// Export the actions
//
export const actions = {
    add,
    merge,
    focus,
    unFocus,
    commenceCreation,
    commenceRemoval,
    abortRemoval,
    confirmRemoval,
    remove,
    setState,
    reloadState,
    copy,
    cut,
    move,
    paste,
    commitPaste,
    hide,
    show,
    updateUri
};

//
// Export the reducer
//
export const reducer = handleActions({
    [system.INIT]: state => $set(
        'cr.nodes',
        new Map({
            byContextPath: fromJSOrdered($get('cr.nodes.byContextPath', state)) || new Map(),
            siteNode: $get('cr.nodes.siteNode', state) || '',
            focused: new Map({
                contextPath: '',
                fusionPath: ''
            }),
            toBeRemoved: '',
            clipboard: $get('cr.nodes.clipboard', state) || '',
            clipboardMode: $get('cr.nodes.clipboardMode', state) || ''
        })
    ),
    [ADD]: ({nodeMap}) => $all(
        ...Object.keys(nodeMap).map(contextPath => $set(
            ['cr', 'nodes', 'byContextPath', contextPath],
            fromJSOrdered(
                //
                // the data is passed from *the guest iFrame*. Because of this, at least in Chrome, fromJSOrdered() does not do anything;
                // as the object has a different prototype than the default "Object". For this reason, we need to JSON-encode-and-decode
                // the data, to scope it relative to *this* frame.
                //
                JSON.parse(JSON.stringify(nodeMap[contextPath]))
            )
        ))
    ),
    [MOVE]: ({nodeToBeMoved: sourceNodeContextPath, targetNode: targetNodeContextPath, position}) => state => {
        // Determine base node into which we'll be inserting
        let baseNodeContextPath;
        if (position === 'into') {
            baseNodeContextPath = targetNodeContextPath;
        } else {
            baseNodeContextPath = parentNodeContextPath(targetNodeContextPath);
        }

        const sourceNodeParentContextPath = parentNodeContextPath(sourceNodeContextPath);
        const originalSourceChildren = $get(['cr', 'nodes', 'byContextPath', sourceNodeParentContextPath, 'children'], state);
        const sourceIndex = originalSourceChildren.findIndex(child => $get('contextPath', child) === sourceNodeContextPath);
        const childRepresentationOfSourceNode = originalSourceChildren.get(sourceIndex);

        let processedChildren = $get(['cr', 'nodes', 'byContextPath', baseNodeContextPath, 'children'], state);

        const transformations = [];
        if (sourceNodeParentContextPath === baseNodeContextPath) {
            // If moving into the same parent, delete source node from it
            processedChildren = processedChildren.delete(sourceIndex);
        } else {
            // Else add an extra transformation to delete the source node from its parent
            const processedSourceChildren = originalSourceChildren.delete(sourceIndex);
            transformations.push($set(['cr', 'nodes', 'byContextPath', sourceNodeParentContextPath, 'children'], processedSourceChildren));
        }

        // Add source node to the children of the base node, at the right position
        if (position === 'into') {
            processedChildren = processedChildren.push(childRepresentationOfSourceNode);
        } else {
            const targetIndex = processedChildren.findIndex(child => $get('contextPath', child) === targetNodeContextPath);
            const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
            processedChildren = processedChildren.insert(insertIndex, childRepresentationOfSourceNode);
        }
        transformations.push($set(['cr', 'nodes', 'byContextPath', baseNodeContextPath, 'children'], processedChildren));

        // Run all transformations
        return $all(...transformations, state);
    },
    [MERGE]: ({nodeMap}) => $all(
        ...Object.keys(nodeMap).map(contextPath => $merge(
            ['cr', 'nodes', 'byContextPath', contextPath],
            fromJSOrdered(
                //
                // the data is passed from *the guest iFrame*. Because of this, at least in Chrome, fromJSOrdered() does not do anything;
                // as the object has a different prototype than the default "Object". For this reason, we need to JSON-encode-and-decode
                // the data, to scope it relative to *this* frame.
                //
                JSON.parse(JSON.stringify(nodeMap[contextPath]))
            )
        )),
        ...Object.keys(nodeMap).filter(contextPath => nodeMap[contextPath].children !== undefined).map(contextPath => $set(
            ['cr', 'nodes', 'byContextPath', contextPath, 'children'],
            fromJSOrdered(
                //
                // the data is passed from *the guest iFrame*. Because of this, at least in Chrome, fromJSOrdered() does not do anything;
                // as the object has a different prototype than the default "Object". For this reason, we need to JSON-encode-and-decode
                // the data, to scope it relative to *this* frame.
                //
                JSON.parse(JSON.stringify(nodeMap[contextPath].children))
            )
        )),
        ...Object.keys(nodeMap).filter(contextPath => nodeMap[contextPath].matchesCurrentDimensions !== undefined).map(contextPath => $set(
            ['cr', 'nodes', 'byContextPath', contextPath, 'matchesCurrentDimensions'],
            nodeMap[contextPath].matchesCurrentDimensions
        )),
    ),
    [FOCUS]: ({contextPath, fusionPath}) => state => $all(
        $set('cr.nodes.focused', new Map({contextPath, fusionPath})),
        // Set currentlyEditedPropertyName to currentlyEditedPropertyNameIntermediate and clear out currentlyEditedPropertyNameIntermediate
        // This is needed because SET_CURRENTLY_EDITED_PROPERTY_NAME if fired before SET_FOCUS, but we still want to clear out currentlyEditedPropertyName
        // when SET_FOCUS is triggered not from inline
        $set('ui.contentCanvas.currentlyEditedPropertyName', $get('ui.contentCanvas.currentlyEditedPropertyNameIntermediate', state)),
        $set('ui.contentCanvas.currentlyEditedPropertyNameIntermediate', ''),
        state
    ),
    [UNFOCUS]: () => $set('cr.nodes.focused', new Map({
        contextPath: '',
        fusionPath: ''
    })),
    [COMMENCE_REMOVAL]: contextPath => $set('cr.nodes.toBeRemoved', contextPath),
    [REMOVAL_ABORTED]: () => $set('cr.nodes.toBeRemoved', ''),
    [REMOVAL_CONFIRMED]: () => $set('cr.nodes.toBeRemoved', ''),
    [REMOVE]: contextPath => $drop(['cr', 'nodes', 'byContextPath', contextPath]),
    [SET_STATE]: ({siteNodeContextPath, documentNodeContextPath, nodes, merge}) => $all(
        $set('cr.nodes.siteNode', siteNodeContextPath),
        $set('ui.contentCanvas.contextPath', documentNodeContextPath),
        $set('cr.nodes.focused', new Map({
            contextPath: '',
            fusionPath: ''
        })),
        merge ? $merge('cr.nodes.byContextPath', fromJSOrdered(nodes)) : $set('cr.nodes.byContextPath', fromJSOrdered(nodes))
    ),
    [COPY]: contextPath => $all(
        $set('cr.nodes.clipboard', contextPath),
        $set('cr.nodes.clipboardMode', 'Copy')
    ),
    [CUT]: contextPath => $all(
        $set('cr.nodes.clipboard', contextPath),
        $set('cr.nodes.clipboardMode', 'Move')
    ),
    [COMMIT_PASTE]: clipboardMode => state => {
        if (clipboardMode === 'Move') {
            return $all(
                $set('cr.nodes.clipboard', ''),
                $set('cr.nodes.clipboardMode', ''),
                state
            );
        }
        return state;
    },
    [HIDE]: contextPath => $set(['cr', 'nodes', 'byContextPath', contextPath, 'properties', '_hidden'], true),
    [SHOW]: contextPath => $set(['cr', 'nodes', 'byContextPath', contextPath, 'properties', '_hidden'], false),
    [UPDATE_URI]: ({oldUriFragment, newUriFragment}) => state => {
        const allNodes = $get('cr.nodes.byContextPath', state);
        return $all(
            ...allNodes.map(node => {
                const nodeUri = $get('uri', node);
                if (
                    nodeUri &&
                    // Make sure to not include false positives by checking that the given segment ends either with "/" or "@"
                    (nodeUri.includes(oldUriFragment + '/') || nodeUri.includes(oldUriFragment + '@'))
                ) {
                    const contextPath = $get('contextPath', node);
                    return $set(
                        ['cr', 'nodes', 'byContextPath', contextPath, 'uri'],
                        nodeUri
                            // Node with changes uriPathSegment
                            .replace(oldUriFragment + '@', newUriFragment + '@')
                            // Descendant of a node with changed uriPathSegment
                            .replace(oldUriFragment + '/', newUriFragment + '/')
                    );
                }
                return null;
            }).filter(i => i).toArray(),
            state
        );
    }
});

//
// Export the selectors
//
export {selectors};
