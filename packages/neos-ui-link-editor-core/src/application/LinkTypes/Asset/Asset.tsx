import * as React from 'react';

import {ILink, ILinkType} from '../../../domain';
import {IconCard, ImageCard} from '../../../presentation';

import {MediaBrowser} from './MediaBrowser';
import {isSuitableFor} from './AssetSpecification';
import {translate} from '@neos-project/neos-ui-i18n';
import {usePromise} from '@neos-project/framework-promise-react';
import backend from '@neos-project/neos-ui-backend-connector';
import {State} from '@neos-project/framework-observable';
import {useLatestState} from '@neos-project/framework-observable-react';
import {Label, TextInput, Tooltip} from '@neos-project/react-ui-components';

type AssetLinkModel = {
    isDirty: boolean
    identifier?: string,
    anchor?: {
        warning?: string,
        value?: string
    }
}

const validateModel = (values: AssetLinkModel): AssetLinkModel => ({
    ...values,
    anchor: {
        ...values.anchor,
        warning: (
            !values.anchor?.value ? undefined : (
                (values.anchor.value.startsWith(' ') || values.anchor.value.endsWith(' ')) ? (
                    translate('Neos.Neos.Ui:LinkEditor.Asset:anchor.validation.leadingOrTrailingSpace', '')
                ) : undefined
            )
        )
    }
});

export const Asset: ILinkType<AssetLinkModel> = {
    id: 'Asset',

    icon: 'camera',

    getTitle: () => translate('Neos.Neos.Ui:LinkEditor.Asset:title', ''),

    isSuitableFor,

    isDirty: (model) => {
        return model.isDirty;
    },

    isValid: (model) => {
        return Boolean(model.identifier);
    },

    isAdvanced: (model) => {
        return Boolean(model.anchor?.value);
    },

    convertLinkToModel: (link: ILink) => {
        const match = /asset:\/\/([^#]*)(?:#(.*))?/.exec(link.href);

        if (!match) {
            throw new Error(`Asset link type cannot handle href "${link.href}".`);
        }

        const identifier = match[1];
        const anchor = match[2];

        return validateModel({isDirty: false, identifier, anchor: {value: anchor}});
    },

    convertModelToLink: (model: AssetLinkModel) => ({
        href: `asset://${model.identifier}${model.anchor?.value ? `#${model.anchor.value}` : ''}`
    }),

    Preview: ({model}: {model: AssetLinkModel}) => {
        const asset = usePromise(() => {
            const {endpoints} = backend.get();
            return endpoints.assetDetail(model.identifier!);
        }, [model.identifier]);

        if (asset.isLoading) {
            return (
                <IconCard
                    icon="spinner"
                    title={translate('Neos.Neos.Ui:LinkEditor.Asset:loadingPreview', '')}
                    subTitle={`asset://${model.identifier}`}
                />
            );
        }

        if (!asset.value) {
            return null;
        }

        return (
            <ImageCard
                label={<>
                    {asset.value.label}
                    {model.anchor?.value ? <i> #{model.anchor.value}</i> : ''}
                </>}
                src={asset.value.preview}
            />
        );
    },

    Editor: ({model$}: {model$: State<AssetLinkModel | null>}) => {
        const model = useLatestState(model$);
        const setAsset = React.useCallback((identifier) => model$.update((values) => validateModel({...values, isDirty: true, identifier})), []);

        return <MediaBrowser
            assetIdentifier={model?.identifier ?? null}
            onSelectAsset={setAsset}
        />;
    },

    AdvancedEditor: ({model$}: {model$: State<AssetLinkModel | null>}) => {
        const model = useLatestState(model$);
        const setAnchor = React.useCallback((anchor) => model$.update((values) => validateModel({...values, isDirty: true, anchor: {value: anchor}})), []);

        return (
            <div>
                <Label htmlFor="neos-LinkEditor-Asset-anchor">
                    {translate('Neos.Neos.Ui:LinkEditor.Asset:anchor.label', '')}
                </Label>
                <TextInput
                    id="neos-LinkEditor-Asset-anchor"
                    type="text"
                    value={model?.anchor?.value ?? ''}
                    placeholder={translate('Neos.Neos.Ui:LinkEditor.Asset:anchor.placeholder', '')}
                    onChange={setAnchor}
                />
                {model?.anchor?.warning ? (
                    <Tooltip renderInline asWarning>{model.anchor.warning}</Tooltip>
                ) : null}
            </div>
        );
    }
};
