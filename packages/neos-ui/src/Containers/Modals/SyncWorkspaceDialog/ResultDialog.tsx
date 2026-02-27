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

import {translate} from '@neos-project/neos-ui-i18n';
import {Button, Dialog, Icon} from '@neos-project/react-ui-components';
import {AnyError, ErrorView} from '@neos-project/neos-ui-error';

import {Diagram} from './Diagram';

import style from './style.module.css';
import {SyncingPhase} from '@neos-project/neos-ui-redux-store/src/CR/Syncing';

const VARIANTS_BY_SYNCING_PHASE = {
    [SyncingPhase.SUCCESS]: {
        icon: 'check',
        style: 'success',
        label: {
            title: {
                id: 'Neos.Neos.Ui:SyncWorkspaceDialog:success.title',
                fallback: 'Workspace "{workspaceName}" is up-to-date'
            },
            message: {
                id: 'Neos.Neos.Ui:SyncWorkspaceDialog:success.message',
                fallback: 'Workspace "{workspaceName}" has been successfully synchronized with all recent changes in workspace "{baseWorkspaceName}".'
            }
        }
    },
    [SyncingPhase.ERROR]: {
        icon: 'exclamation-circle',
        style: 'error',
        label: {
            title: {
                id: 'Neos.Neos.Ui:SyncWorkspaceDialog:error.title',
                fallback: 'Workspace "{workspaceName}" could not be synchronized'
            },
            message: {
                id: 'Neos.Neos.Ui:SyncWorkspaceDialog:error.message',
                fallback: 'Workspace "{workspaceName}" could not be synchronized with the recent changes in workspace "{baseWorkspaceName}".'
            }
        }
    }
} as const;

type Result =
    | {
        phase: SyncingPhase.ERROR;
        error: AnyError;
    }
    | { phase: SyncingPhase.SUCCESS };

export const ResultDialog: React.FC<{
    workspaceName: string;
    baseWorkspaceName: string;
    result: Result;
    onRetry: () => void;
    onAcknowledge: () => void;
}> = (props) => {
    const variant = VARIANTS_BY_SYNCING_PHASE[props.result.phase];

    return (
        <Dialog
            actions={props.result.phase === SyncingPhase.ERROR ? [
                <Button
                    id="neos-SyncWorkspace-Acknowledge"
                    key="acknowledge"
                    style="lighter"
                    hoverStyle="brand"
                    onClick={props.onAcknowledge}
                    className={style.button}
                >
                    {translate('Neos.Neos.Ui:SyncWorkspaceDialog:error.acknowledge', 'Cancel')}
                </Button>,
                <Button
                    id="neos-SyncWorkspace-Retry"
                    key="retry"
                    style="warn"
                    hoverStyle="warn"
                    onClick={props.onRetry}
                    className={style.button}
                >
                    <Icon icon="refresh" className={style.icon} />
                    {translate('Neos.Neos.Ui:SyncWorkspaceDialog:error.retry', 'Try again')}
                </Button>
            ] : [
                <Button
                    id="neos-SyncWorkspace-Acknowledge"
                    key="acknowledge"
                    style="success"
                    hoverStyle="success"
                    onClick={props.onAcknowledge}
                    className={style.button}
                >
                    <Icon icon="check" className={style.icon} />
                    {translate('Neos.Neos.Ui:SyncWorkspaceDialog:success.acknowledge', 'OK')}
                </Button>
            ]}
            title={
                <div className={style.modalTitle}>
                    <Icon icon={variant.icon} />
                    {translate(variant.label.title.id, variant.label.title.fallback, props as any)}
                </div>
            }
            onRequestClose={props.onAcknowledge}
            type={variant.style}
            isOpen
            autoFocus
            preventClosing={props.result.phase === SyncingPhase.ERROR}
            theme={undefined as any}
            style={undefined as any}
        >
            <div className={style.modalContents}>
                <Diagram
                    phase={props.result.phase}
                    workspaceName={props.workspaceName}
                    baseWorkspaceName={props.baseWorkspaceName}
                    />
                {props.result.phase === SyncingPhase.ERROR
                    ? (<ErrorView error={props.result.error} />)
                    : translate(variant.label.message.id, variant.label.message.fallback, props as any)
                }
            </div>
        </Dialog>
    );
};
