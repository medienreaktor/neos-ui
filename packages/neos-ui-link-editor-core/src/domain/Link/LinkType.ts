import * as React from 'react';
import positionalArraySorter from '@neos-project/positional-array-sorter';

import {getRegistryById} from '@neos-project/neos-ui-registry';

import {ILink} from './Link';
import {IEditor} from '../Editor';
import {useLatestState} from '@neos-project/framework-observable-react';
import {State} from '@neos-project/framework-observable';

interface LinkTypeProps<ModelType = any, OptionsType extends object = {}> {
    model: ModelType
    options: OptionsType
}

export interface ILinkType<ModelType = any, OptionsType extends object = {}> {
    id: string

    icon: string
    getTitle: () => string

    isSuitableFor: (link: Pick<ILink, 'href'>) => boolean

    convertLinkToModel: (link: ILink) => ModelType
    convertModelToLink: (model: ModelType) => Pick<ILink, 'href'>
    isDirty: (model: ModelType) => boolean;
    isValid: (model: ModelType) => boolean;
    /**
     * Whether the AdvancedEditor was used to enter values to the model.
     */
    isAdvanced?: (model: ModelType) => boolean;

    Preview: React.FC<LinkTypeProps<ModelType, OptionsType>>
    Editor: React.FC<{
        model$: State<ModelType | null>
        options: OptionsType
    }>
    AdvancedEditor?: React.FC<{
        model$: State<ModelType | null>
        options: OptionsType
    }>
}

export interface ILinkTypeFactoryApi {
    createError: (message: string) => Error
}

export function useLinkTypeForHref(href: null | string, availableLinkTypes: ILinkType[]): null | ILinkType {
    const result = React.useMemo(() => {
        if (href === null) {
            return null;
        }

        for (const linkType of availableLinkTypes) {
            if (linkType.isSuitableFor({href})) {
                return linkType;
            }
        }

        return null;
    }, [availableLinkTypes, href]);

    return result;
}

export function useSortedAndFilteredLinkTypes(editor: IEditor): ILinkType[] {
    const linkTypes = getRegistryById('@neos-project/neos-ui-link-editor/link-types')?.getAllAsList() ?? [];

    const {editorOptions} = useLatestState(editor.state$);

    const result = React.useMemo(() => {
        const linkTypesAndEditorOptions = linkTypes.map(
            (linkType) => ({
                linkType,
                options: editorOptions.linkTypes?.[linkType.id]
            })
        )

        const sortedLinkTypesViaEditorOptionsPosition = positionalArraySorter(
            linkTypesAndEditorOptions,
            // badly typed
            ({options}) => options?.position
        )

        const filteredLinkTypes = sortedLinkTypesViaEditorOptionsPosition.filter(
            ({options}) => (options && 'enabled' in options) ? options.enabled : true
        )

        return filteredLinkTypes.map(
            ({linkType}) => linkType
        );
    }, [editorOptions]);

    return result;
}
