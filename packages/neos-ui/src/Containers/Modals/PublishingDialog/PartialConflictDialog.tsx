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
import {translate} from '@neos-project/neos-ui-i18n';
import {PublishingMode, PublishingPhase, PublishingScope} from '@neos-project/neos-ui-redux-store/src/CR/Publishing';

import {Diagram} from './Diagram';

import style from './style.module.css';

const PartialConfictDialogVariants = {
    id: 'neos-partialConflictDialog',
    style: 'warn',
    icon: {
        title: 'share-square-o',
        confirm: 'share-square-o'
    },
    label: {
        title: {
            id: 'Neos.Neos.Ui:PublishingDialog:partialConflict.document.confirmation.title',
            fallback: 'Could not publish changes in document "{scopeTitle}"'
        },
        message: {
            id: 'Neos.Neos.Ui:PublishingDialog:partialConflict.document.confirmation.message',
            fallback: 'There seem to be dependencies to other documents. Do you want to instead publish all changes in site to workspace "{targetWorkspaceName}"?'
        },
        cancel: {
            id: 'Neos.Neos.Ui:PublishingDialog:partialConflict.document.confirmation.cancel',
            fallback: 'No, cancel'
        },
        confirm: {
            id: 'Neos.Neos.Ui:PublishingDialog:partialConflict.document.confirmation.confirm',
            fallback: 'Yes, publish all changes in site'
        }
    }
} as const;

type PartialConflictDialogProps = {
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

export const PartialConflictDialog: React.FC<PartialConflictDialogProps> = (props) => {
    const variant = PartialConfictDialogVariants;

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
                    {translate(variant.label.cancel.id, variant.label.cancel.fallback)}
                </Button>,
                <Button
                    id={`${variant.id}-Confirm`}
                    key="confirm"
                    style={variant.style}
                    hoverStyle={variant.style}
                    onClick={props.onConfirm}
                >
                    <Icon icon={variant.icon.confirm} className={style.buttonIcon} />
                    {translate(variant.label.confirm.id, variant.label.confirm.fallback)}
                </Button>
            ]}
            title={<div>
                <Icon icon={variant.icon.title} />
                <span className={style.modalTitle}>
                    {translate(variant.label.title.id, variant.label.title.fallback, props as any)}
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
                {translate(variant.label.message.id, variant.label.message.fallback, props as any)}
            </div>
        </Dialog>
    );
};
