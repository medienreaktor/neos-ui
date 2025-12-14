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
export const upcastLegacyLinkEditorOptions = (legacyLinkEditorOptions: LegacyLinkEditorOptions|null|undefined, linkEditorOptions: IEditorState['editorOptions']): IEditorState['editorOptions'] => {
    if (!legacyLinkEditorOptions) {
        return linkEditorOptions;
    }
    return {
        ...linkEditorOptions,
        linkTypes: {
            ...linkEditorOptions.linkTypes,
            Node: {
                ...('nodes' in legacyLinkEditorOptions ? {enabled: Boolean(legacyLinkEditorOptions.nodes)} : {}),
                ...(typeof legacyLinkEditorOptions.startingPoint === 'string' ? {startingPoint: legacyLinkEditorOptions.startingPoint} : {}),
                ...(typeof legacyLinkEditorOptions.nodeTypes === 'string' && legacyLinkEditorOptions.nodeTypes ? {baseNodeType: legacyLinkEditorOptions.nodeTypes} : {}),
                ...(Array.isArray(legacyLinkEditorOptions.nodeTypes) && legacyLinkEditorOptions.nodeTypes.join(',') ? {baseNodeType: legacyLinkEditorOptions.nodeTypes.join(',')} : {}),
                ...linkEditorOptions.linkTypes?.Node
            },
            Asset: {
                ...('assets' in legacyLinkEditorOptions ? {enabled: Boolean(legacyLinkEditorOptions.assets)} : {}),
                ...linkEditorOptions.linkTypes?.Asset
            }
        }
    }
}
