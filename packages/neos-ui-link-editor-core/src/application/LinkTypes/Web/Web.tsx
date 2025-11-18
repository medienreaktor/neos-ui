import * as React from 'react';

import {ILink, ILinkType} from '../../../domain';
import {IconCard} from '../../../presentation';
import {isSuitableFor} from './WebSpecification';
import {translate} from '@neos-project/neos-ui-i18n';
import {State} from '@neos-project/framework-observable';
import {useLatestState} from '@neos-project/framework-observable-react';
import {Label, SelectBox, Tooltip} from '@neos-project/react-ui-components';

type WebLinkModel = {
    href: {
        value: string,
        isDirty: boolean,
        warning?: string
        formattingOptions?: any[]
    }
}

const formattingOptionForLinkWithoutHttpsProtocol = (href: string) => {
    if (!href.match(/^[\w.-]{2,}\.[\w]{2,10}$/)) {
        return null;
    }
    // looks like domain
    return {
        group: translate('Neos.Neos.Ui:LinkEditor.Web:href.formatOptions', ''),
        label: translate('Neos.Neos.Ui:LinkEditor.Web:href.formatAsHttp', ''),
        value: `https://${href}`
    };
};

const validateModel = (values: WebLinkModel): WebLinkModel => ({
    ...values,
    href: {
        ...values.href,
        warning: (
            !values.href?.value ? undefined : (
                // eslint-disable-next-line no-script-url
                values.href.value.includes('javascript:') ? (
                    translate('Neos.Neos.Ui:LinkEditor.Web:href.validation.javascriptSchema', '')
                ) : values.href.value.startsWith('node://') ? (
                    translate('Neos.Neos.Ui:LinkEditor.Web:href.validation.nodeSchema', '')
                ) : values.href.value.startsWith('asset://') ? (
                    translate('Neos.Neos.Ui:LinkEditor.Web:href.validation.assetSchema', '')
                ) : values.href.value.startsWith('tel:') ? (
                    translate('Neos.Neos.Ui:LinkEditor.Web:href.validation.telSchema', '')
                ) : values.href.value.startsWith('mailto:') ? (
                    translate('Neos.Neos.Ui:LinkEditor.Web:href.validation.telSchema', '')
                ) : (values.href.value.startsWith(' ') || values.href.value.endsWith(' ')) ? (
                    translate('Neos.Neos.Ui:LinkEditor.Web:href.validation.leadingOrTrailingSpace', '')
                ) : undefined
            )
        )
    }
});

export const Web: ILinkType<WebLinkModel> = {
    id: 'LinkEditor:Web',

    icon: 'globe',

    getTitle: () => translate('Neos.Neos.Ui:LinkEditor.Web:title', ''),

    isSuitableFor,

    isDirty: (model) => {
        return model.href?.isDirty === true;
    },

    isValid: (model) => {
        return model.href && model.href.value.trimEnd() !== '';
    },

    convertLinkToModel: (link: ILink) => {
        return validateModel({
            href: {
                isDirty: false,
                value: link.href || '#'
            }
        });
    },

    convertModelToLink: (model: WebLinkModel) => {
        return {
            href: model.href.value
        }
    },

    Preview: ({model}: {model: WebLinkModel}) => (
        <IconCard
            icon="external-link"
            title={model.href.value || '#'}
        />
    ),

    Editor: ({model$}: {model$: State<WebLinkModel | null>}) => {
        const model = useLatestState(model$);

        const setHref = React.useCallback((href) => model$.update((values) => validateModel({
            ...values,
            href: {
                isDirty: true,
                formattingOptions: [
                    formattingOptionForLinkWithoutHttpsProtocol(href)
                ].filter(Boolean),
                value: href
            }
        })), []);

        return (
            <div>
                <Label htmlFor="neos-LinkEditor-Web-href">
                    {translate('Neos.Neos.Ui:LinkEditor.Web:label.link', '')}
                </Label>
                <div>
                    <SelectBox
                        id="neos-LinkEditor-Web-href"
                        options={model?.href.formattingOptions ?? []}
                        optionValueField="value"
                        value={''}
                        plainInputMode={!model?.href.formattingOptions?.length}
                        placeholderIcon={'link'}
                        onValueChange={setHref}
                        threshold={0}
                        placeholder={translate('Neos.Neos.Ui:LinkEditor.Web:href.placeholder', '')}
                        displaySearchBox={true}
                        showDropDownToggle={false}
                        allowEmpty={false}
                        // todo use custom component instead of leveraging select box as magic text field with search and options "hack"
                        searchTerm={model?.href?.value ?? ''}
                        onSearchTermChange={setHref}
                    />
                    {model?.href?.warning ? (
                        <Tooltip renderInline asWarning>{model.href.warning}</Tooltip>
                    ) : null}
                </div>
            </div>
        );
    }
};
