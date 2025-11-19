import * as React from 'react';

import {Label, TextInput, Tooltip} from '@neos-project/react-ui-components';

import {ILink, ILinkType} from '../../../domain';
import {IconCard} from '../../../presentation';
import {isSuitableFor} from './PhoneNumberSpecification';
import {translate} from '@neos-project/neos-ui-i18n';
import {State} from '@neos-project/framework-observable';
import {useLatestState} from '@neos-project/framework-observable-react';

type PhoneNumberLinkModel = {
    phoneNumber: {
        value: string
        isDirty: boolean
        warning?: string
    }
}

const VALID_PHONE_NUMBER = /^(?:\+[1-9])?[0-9]+$/;

const validateModel = (model: PhoneNumberLinkModel): PhoneNumberLinkModel => ({
    ...model,
    phoneNumber: {
        ...model.phoneNumber,
        warning: !model.phoneNumber.value ? translate('Neos.Neos.Ui:LinkEditor.PhoneNumber:phoneNumber.validation.required', '') : (!VALID_PHONE_NUMBER.test(model.phoneNumber.value) ? translate('Neos.Neos.Ui:LinkEditor.PhoneNumber:phoneNumber.validation.numbersOnly', '') : undefined)
    }
});

export const PhoneNumber: ILinkType<PhoneNumberLinkModel> = {
    id: 'PhoneNumber',

    icon: 'phone-alt',

    getTitle: () => translate('Neos.Neos.Ui:LinkEditor.PhoneNumber:title', ''),

    isSuitableFor,

    isDirty: (model) => {
        return model.phoneNumber?.isDirty === true;
    },

    isValid: (model) => {
        if (!model.phoneNumber) {
            return false;
        }
        const trimmedValue = model.phoneNumber.value.trim();
        return trimmedValue !== '' && trimmedValue !== '+';
    },

    convertLinkToModel: (link: ILink) => {
        if (!link.href.startsWith('tel:')) {
            throw new Error(`Phone link type cannot handle href "${link.href}".`);
        }

        return validateModel({
            phoneNumber: {
                value: link.href.replace('tel:', ''),
                isDirty: false
            }
        });
    },

    convertModelToLink: (model: PhoneNumberLinkModel) => {
        return {href: `tel:${model.phoneNumber.value.trim()}`};
    },

    Preview: ({model}: { model: PhoneNumberLinkModel }) => {
        return (
            <IconCard
                icon="phone-alt"
                title={model.phoneNumber.value}
            />
        )
    },

    Editor: ({model$}: { model$: State<PhoneNumberLinkModel | null> }) => {
        const model = useLatestState(model$);
        const setPhoneNumber = React.useCallback((phoneNumber) => model$.update((values) => (validateModel({
            ...values,
            phoneNumber: {
                value: phoneNumber,
                isDirty: true
            }
        }))), []);

        return (
            <div>
                <Label htmlFor="neos-LinkEditor-Phone-number">
                    {translate('Neos.Neos.Ui:LinkEditor.PhoneNumber:phoneNumber.label', '')}
                </Label>
                <TextInput
                    id="neos-LinkEditor-Phone-number"
                    value={model?.phoneNumber?.value ?? ''}
                    onChange={setPhoneNumber}
                    placeholder={translate('Neos.Neos.Ui:LinkEditor.Web:phoneNumber.placeholder', '')}
                />
                {model?.phoneNumber?.warning ? (
                    <Tooltip renderInline asWarning>{model.phoneNumber.warning}</Tooltip>
                ) : null}
            </div>
        );
    }
};
