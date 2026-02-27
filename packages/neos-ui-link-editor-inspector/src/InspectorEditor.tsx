import * as React from 'react';
import {Button, Icon} from '@neos-project/react-ui-components';
import {
    ILinkType,
    useLinkTypeForHref,
    Deletable,
    IEditor, upcastLegacyLinkEditorOptions
} from '@neos-project/neos-ui-link-editor-core';
import {AnyError, ErrorBoundary, ErrorView} from '@neos-project/neos-ui-error';
import {ILink, useSortedAndFilteredLinkTypes} from '@neos-project/neos-ui-link-editor-core/src/domain';
import {ILinkOptions} from '@neos-project/neos-ui-link-editor-core/src/domain';
import {
    convertILinkToSerializedLinkValue,
    LinkDataType,
    resolveSerializedLinkFromValue,
    serializedLinkToILink
} from './serialisation';
import {translate} from '@neos-project/neos-ui-i18n';
import {DisabledWrap, SeamlessButton} from './presentation';

export type EditorProps = {
    id?: string
    options?: {
        linkTypes?: {
            [key: string]: object
        }
        title?: boolean
        relNofollow?: boolean
        targetBlank?: boolean
        download?: boolean
        disabled?: boolean

        // @deprecated legacy root level options from the old LinkEditor, will be upcast to new `linkTypes` format
        startingPoint?: string
        nodeTypes?: string | string[]
        assets?: boolean
        nodes?: boolean
    };
    value: any;
    commit(value: any): void;
};

export const createInspectorEditor = (dataType: LinkDataType, editor: IEditor) => (props: EditorProps) => {
    const reset = () => props.commit('');

    const {transactions} = editor;

    const serializedLink = resolveSerializedLinkFromValue(props.value, dataType);

    const availableLinkTypes = useSortedAndFilteredLinkTypes(editor);

    const linkType = useLinkTypeForHref(
        serializedLinkToILink(serializedLink)?.href ?? null,
        availableLinkTypes
    );

    const enabledLinkOptions = React.useMemo(() => {
        const enabledLinkOptions: (keyof ILinkOptions)[] = [];

        if (serializedLink.dataType === LinkDataType.string) {
            // the simple type does not allow link-options
            return enabledLinkOptions;
        }

        if (props.options?.title) {
            enabledLinkOptions.push('title');
        }

        if (props.options?.relNofollow) {
            enabledLinkOptions.push('relNofollow');
        }

        if (props.options?.targetBlank) {
            enabledLinkOptions.push('targetBlank');
        }

        if (props.options?.download) {
            enabledLinkOptions.push('download');
        }

        return enabledLinkOptions;
    }, [props.options]);

    const editLink = React.useCallback(async () => {
        const result = await transactions.editLink(
            serializedLinkToILink(serializedLink),
            enabledLinkOptions,
            props.options?.linkTypes ? ({
                linkTypes: {
                    ...props.options?.linkTypes
                }
            }) : upcastLegacyLinkEditorOptions(props.options?.linkTypes)
        );

        if (result.change) {
            if (!result.value) {
                reset();
                return;
            }

            props.commit(
                convertILinkToSerializedLinkValue(result.value, serializedLink.dataType)
            );
        }
    }, [serializedLink, enabledLinkOptions, transactions.editLink, props.options, props.commit, reset]);

    if (linkType) {
        return (
            <ErrorBoundary errorFallback={ErrorView}>
                <InspectorEditorWithLinkType
                    htmlId={props.id}
                    key={linkType.id}
                    disabled={props.options?.disabled}
                    link={serializedLinkToILink(serializedLink)!}
                    linkType={linkType}
                    options={props.options?.linkTypes?.[linkType.id] ?? {}}
                    editLink={editLink}
                    reset={reset}
                />
            </ErrorBoundary>
        );
    }
    if (serializedLink.value === null) {
        return (
            <Button id={props.id} disabled={props.options?.disabled} onClick={editLink}>
                <Icon icon="link" padded="right"/>
                {translate('Neos.Neos.Ui:LinkEditor.Main:inspector.create')}
            </Button>
        );
    }
    return (
        <Deletable id={props.id} onDelete={reset} hoverStyle="brand" label={translate('Neos.Neos.Ui:LinkEditor.Main:inspector.delete', '')}>
            <ErrorView error={translate('Neos.Neos.Ui:LinkEditor.Main:inspector.notfound', 'Could not determine link editor for value {href}', {href: JSON.stringify(serializedLink.value)})} />
        </Deletable>
    );
};

const InspectorEditorWithLinkType: React.FC<{
    htmlId?: string
    disabled?: boolean
    link: ILink
    linkType: ILinkType
    options: any
    editLink: () => Promise<void>
    reset: () => void
}> = props => {
    const {error, model} = React.useMemo(() => {
        try {
            const model = props.linkType.convertLinkToModel(props.link);
            return {error: null, model};
        } catch (error) {
            return {error: error as AnyError, model: null};
        }
    }, [props.link, props.linkType]);

    const {Preview} = props.linkType;

    if (props.disabled) {
        return error ? (
            <ErrorView error={error} />
        ) : (
            <DisabledWrap>
                <Preview
                    model={model}
                    options={props.options}
                />
            </DisabledWrap>
        )
    }

    return (
        <Deletable id={props.htmlId} onDelete={props.reset} hoverStyle="brand" label={translate('Neos.Neos.Ui:LinkEditor.Main:inspector.delete', '')}>
            {error ? (
                <ErrorView error={error} />
            ) : (
                <SeamlessButton
                    title={translate('Neos.Neos.Ui:LinkEditor.Main:inspector.edit')}
                    onClick={props.editLink}
                >
                    <Preview
                        model={model}
                        options={props.options}
                    />
                </SeamlessButton>
            )}
        </Deletable>
    );
};
