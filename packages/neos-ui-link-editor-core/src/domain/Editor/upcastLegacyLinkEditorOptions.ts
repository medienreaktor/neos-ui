import {IEditorState} from './Editor';

type LegacyLinkEditorOptions = {
    // @deprecated legacy root level options from the old LinkEditor, will be upcast to new `linkTypes` format
    startingPoint?: string
    nodeTypes?: string | string[]
    assets?: boolean
    nodes?: boolean
}

/**
 * @deprecated with Neos 9.1 handle legacy root level option
 */
export const upcastLegacyLinkEditorOptions = (legacyLinkEditorOptions: LegacyLinkEditorOptions|null|undefined): IEditorState['editorOptions'] => {
    if (!legacyLinkEditorOptions) {
        return {
            linkTypes: {}
        }
    }
    return {
        linkTypes: {
            Node: {
                ...('nodes' in legacyLinkEditorOptions ? {enabled: Boolean(legacyLinkEditorOptions.nodes)} : {}),
                ...(typeof legacyLinkEditorOptions.startingPoint === 'string' ? {startingPoint: legacyLinkEditorOptions.startingPoint} : {}),
                ...(typeof legacyLinkEditorOptions.nodeTypes === 'string' && legacyLinkEditorOptions.nodeTypes ? {baseNodeType: legacyLinkEditorOptions.nodeTypes} : {}),
                ...(Array.isArray(legacyLinkEditorOptions.nodeTypes) && legacyLinkEditorOptions.nodeTypes.join(',') ? {baseNodeType: legacyLinkEditorOptions.nodeTypes.join(',')} : {})
            },
            Asset: {
                ...('assets' in legacyLinkEditorOptions ? {enabled: Boolean(legacyLinkEditorOptions.assets)} : {})
            }
        }
    }
}
