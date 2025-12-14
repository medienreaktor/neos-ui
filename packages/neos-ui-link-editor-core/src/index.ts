export {registerLinkTypes, registerDialog} from './application';

export type {IEditor, ILinkType, ILinkOptions} from './domain';
export {
    useLinkTypeForHref,
    createEditor,
    upcastLegacyLinkEditorOptions
} from './domain';

export {Deletable} from './presentation';
