/*
 * This file is part of the Neos.Neos.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */
import React from 'react';

import {Button, Dialog, Icon} from '@neos-project/react-ui-components';
import I18n from '@neos-project/neos-ui-i18n';
import {PublishingMode, PublishingPhase, PublishingScope} from '@neos-project/neos-ui-redux-store/src/CR/Publishing';

import {Diagram} from './Diagram';

import style from './style.module.css';

const PublishAllDialogVariants = {
    id: 'neos-PublishAllDialog',
    style: 'warn',
    icon: {
        title: 'share-square-o',
        confirm: 'share-square-o'
    },
    label: {
        title: {
            id: 'Neos.Neos.Ui:PublishingDialog:publishAll.document.confirmation.title',
            fallback: (props: { scopeTitle: string; }) =>
                `Could not publish changes in document "${props.scopeTitle}"`
        },
        message: {
            id: 'Neos.Neos.Ui:PublishingDialog:publishAll.document.confirmation.message',
            fallback: (props: { scopeTitle: string; sourceWorkspaceName: string; targetWorkspaceName: null | string; }) =>
                `There seem to be dependencies to other documents.
                    Do you want to instead publish all changes in site to workspace "${props.targetWorkspaceName}"? Be careful: This cannot be undone!`
        },
        cancel: {
            id: 'Neos.Neos.Ui:PublishingDialog:publishAll.document.confirmation.cancel',
            fallback: 'No, cancel'
        },
        confirm: {
            id: 'Neos.Neos.Ui:PublishingDialog:publishAll.document.confirmation.confirm',
            fallback: 'Yes, publish all changes in site'
        }
    }
} as const;

type PublishAllDialogProps = {
    mode: PublishingMode;
    scope: PublishingScope;
    scopeTitle: string;
    sourceWorkspaceName: string;
    targetWorkspaceName: null | string;
    numberOfChanges: number;
    numberOfSiteChanges: number;
    onAbort: () => void;
    onConfirm: () => void;
}

export const PublishAllDialog: React.FC<PublishAllDialogProps> = (props) => {
    const variant = PublishAllDialogVariants;

    return (
        <Dialog
            actions={[
                <Button
                    id={`${variant.id}-Cancel`}
                    key="cancel"
                    style="lighter"
                    hoverStyle="brand"
                    onClick={props.onAbort}
                >
                    <I18n {...variant.label.cancel} />
                </Button>,
                <Button
                    id={`${variant.id}-Confirm`}
                    key="confirm"
                    style={variant.style}
                    hoverStyle={variant.style}
                    onClick={props.onConfirm}
                >
                    <Icon icon={variant.icon.confirm} className={style.buttonIcon} />
                    <I18n {...variant.label.confirm} />
                </Button>
            ]}
            title={<div>
                <Icon icon={variant.icon.title} />
                <span className={style.modalTitle}>
                    <I18n
                        id={variant.label.title.id}
                        params={props}
                        fallback={variant.label.title.fallback(props)}
                    />
                </span>
            </div>}
            onRequestClose={props.onAbort}
            type={variant.style}
            isOpen
            autoFocus
            theme={undefined as any}
            style={undefined as any}
        >
            <div className={style.modalContents}>
                <Diagram
                    phase={PublishingPhase.PARTIAL_PUBLISH_CONFLICTS}
                    sourceWorkspaceName={props.sourceWorkspaceName}
                    targetWorkspaceName={props.targetWorkspaceName}
                    numberOfChanges={props.numberOfSiteChanges}
                />
                <I18n
                    id={variant.label.message.id}
                    params={props}
                    fallback={variant.label.message.fallback(props)}
                />
            </div>
        </Dialog>
    );
};
