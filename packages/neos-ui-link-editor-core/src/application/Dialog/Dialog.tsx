import * as React from 'react';

import {Button, Dialog, Tabs} from '@neos-project/react-ui-components';

import {AnyError, ErrorBoundary, ErrorView} from '@neos-project/neos-ui-error';

import {IEditor, ILink, ILinkOptions, ILinkType, useLinkTypeForHref, useSortedAndFilteredLinkTypes} from '../../domain';
import {Deletable, Form} from '../../presentation';
import {useLatestState} from '@neos-project/framework-observable-react';
import {useSelector} from '@neos-project/neos-ui-redux-store';
import {translate} from '@neos-project/neos-ui-i18n';
import {createState, mapState, pickState, State} from '@neos-project/framework-observable';
import {PanelProps} from '@neos-project/react-ui-components/src/Tabs/panel';
import {AdvancedOptions} from './AdvancedOptions';

export type FormValues = {
    isOptionsDirty: boolean
    initialLinkWasDeleted: boolean
    activeLinkTypeId: string
    options: ILinkOptions,
    linkModels: {
        [linkTypeId: string]: any
    }
}

// @ts-ignore "Panel" is not visible to typescript
const TabsPanel: React.FC<PanelProps> = Tabs.Panel;

export const createDialog = (editor: IEditor) => () => {
    const {isOpen, initialValue} = useLatestState(editor.state$);

    if (isOpen) {
        return <LinkEditorDialog editor={editor} initialValue={initialValue}/>;
    }

    return null;
};

const LinkEditorDialog: React.FC<{
    editor: IEditor
    initialValue: ILink | null
}> = ({editor, initialValue}) => {
    const {dismiss, apply, unset} = editor.transactions;

    const {editorOptions} = useLatestState(editor.state$);

    const availableLinkTypes = useSortedAndFilteredLinkTypes(editor);

    const initialLinkType = useLinkTypeForHref(initialValue?.href ?? null, availableLinkTypes);

    const {error: initialError, model: initialModel} = React.useMemo(() => {
        if (!initialLinkType || !initialValue) {
            return {error: null, model: null};
        }
        try {
            const model = initialLinkType.convertLinkToModel(initialValue);
            return {error: null, model};
        } catch (error) {
            return {error: error as AnyError, model: null};
        }
    }, [initialLinkType, initialValue]);

    const form$ = React.useMemo(() => createState({
        isOptionsDirty: false,
        initialLinkWasDeleted: false,
        activeLinkTypeId: initialLinkType?.id ?? availableLinkTypes[0].id,
        options: initialValue?.options ?? {},
        linkModels: initialLinkType
            ? {
                [initialLinkType.id]: initialModel
            }
            : {}
    } as FormValues), []);

    const formStatus$ = React.useMemo(() => mapState(form$, (form) => {
        const linkType = availableLinkTypes.find(linkType => linkType.id === form.activeLinkTypeId);
        if (!linkType) {
            throw Error(`Fatal: Link type ${form.activeLinkTypeId} does no longer exist.`)
        }

        const model = form.linkModels[form.activeLinkTypeId];

        return {
            isDirty: form.isOptionsDirty || (model ? linkType.isDirty(model) : false),
            isValid: model ? linkType.isValid(model) : false,
            initialLinkWasDeleted: form.initialLinkWasDeleted,
            activeLinkTypeId: form.activeLinkTypeId,
            activeModel: model,
            activeLinkType: linkType
        };
    }), []);

    const formStatus = useLatestState(formStatus$);

    const handleSubmit = React.useCallback(() => {
        const form = form$.current;
        if (!form) {
            return;
        }

        const linkType = availableLinkTypes.find(linkType => linkType.id === form.activeLinkTypeId);
        if (!linkType) {
            throw Error(`Fatal: Link type ${form.activeLinkTypeId} does no longer exist.`)
        }

        const linkTypeModel = form$.current.linkModels[form.activeLinkTypeId];

        if (linkTypeModel && (linkType.isDirty(linkTypeModel) || form.isOptionsDirty) && linkType.isValid(linkTypeModel)) {
            const link = {
                href: linkType.convertModelToLink(linkTypeModel).href,
                options: form.options

            };
            apply(link);
        } else if (form.initialLinkWasDeleted) {
            unset();
        } else {
            console.error('NeosUi LinkEditor: Nothing to do, handleSubmit should not have been invoked.');
        }
    }, []);

    const unsetLinkModels = React.useCallback(() => {
        form$.update((values) => ({
            ...values,
            options: {},
            initialLinkWasDeleted: values.initialLinkWasDeleted || Boolean(initialLinkType),
            linkModels: {}
        }));
    }, []);

    const isAuthenticated = useSelector(state => !state.system?.authenticationTimeout);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <Dialog
            id="neos-LinkEditor"
            isOpen={true}
            preventClosing={formStatus.isDirty}
            onRequestClose={dismiss}
            title={<div>{initialValue === null
                ? translate('Neos.Neos.Ui:LinkEditor.Main:dialog.title.create', 'Create Link')
                : translate('Neos.Neos.Ui:LinkEditor.Main:dialog.title.edit', 'Edit Link')
            }</div>}
            style="auto"
            autoFocus={true}
            actions={[
                <Button onClick={dismiss}>
                    {translate('Neos.Neos.Ui:LinkEditor.Main:dialog.action.cancel', '')}
                </Button>,
                <Button
                    id="neos-LinkEditor-submit"
                    style="success"
                    type="submit"
                    disabled={!formStatus.initialLinkWasDeleted && (!formStatus.isDirty || !formStatus.isValid)}
                    onClick={handleSubmit}
                >
                    {initialValue === null
                        ? translate('Neos.Neos.Ui:LinkEditor.Main:dialog.action.create', '')
                        : translate('Neos.Neos.Ui:LinkEditor.Main:dialog.action.update', '')}
                </Button>
            ]}
        >
            <ErrorBoundary errorFallback={ErrorView}>
                <Form>
                    {formStatus.isDirty && formStatus.isValid ? (
                        <Deletable id="neos-LinkEditor-Preview" onDelete={unsetLinkModels} label={translate('Neos.Neos.Ui:LinkEditor.Main:dialog.action.delete', '')}>
                            <ErrorBoundary errorFallback={ErrorView}>
                                {
                                    React.createElement(formStatus.activeLinkType.Preview, {
                                        model: formStatus.activeModel,
                                        options: editorOptions.linkTypes?.[formStatus.activeLinkTypeId] as any ?? {}
                                    })
                                }
                            </ErrorBoundary>
                        </Deletable>
                    ) : (
                        !formStatus.initialLinkWasDeleted && initialLinkType ? (
                            <Deletable id="neos-LinkEditor-Preview" onDelete={unsetLinkModels} label={translate('Neos.Neos.Ui:LinkEditor.Main:dialog.action.delete', '')}>
                                <ErrorBoundary errorFallback={ErrorView}>
                                    {
                                        initialError ? (
                                            <ErrorView error={initialError} />
                                        ) : (
                                            React.createElement(initialLinkType.Preview, {
                                                model: initialModel,
                                                options: editorOptions.linkTypes?.[initialLinkType.id] as any ?? {}
                                            })
                                        )
                                    }
                                </ErrorBoundary>
                            </Deletable>
                        ) : null
                    )}
                    <DialogContents
                        form$={form$}
                        editor={editor}
                        initialModel={formStatus.initialLinkWasDeleted ? null : initialModel}
                        initialLinkType={formStatus.initialLinkWasDeleted ? null : initialLinkType}
                        availableLinkTypes={availableLinkTypes}
                    />
                </Form>
            </ErrorBoundary>
        </Dialog>
    )
}

const DialogContents: React.FC<{
    form$: State<FormValues>
    editor: IEditor,
    initialModel: any | null,
    initialLinkType: ILinkType | null,
    availableLinkTypes: ReadonlyArray<ILinkType>
}> = props => {
    const {editorOptions} = useLatestState(props.editor.state$);

    const setActiveTab = React.useCallback((linkId) => props.form$.update((values) => ({...values, activeLinkTypeId: linkId})), []);
    const activeTab$ = React.useMemo(() => mapState(props.form$, (form) => form.activeLinkTypeId), []);
    const activeTab = useLatestState(activeTab$);

    const linkModels$ = React.useMemo(() => pickState(props.form$, 'linkModels'), []);

    return (
        <Tabs
            activeTab={activeTab}
            onActiveTabChange={setActiveTab}
            vertical
        >
            {props.availableLinkTypes.map((linkType) => {
                const {Editor} = linkType;
                const model$ = React.useMemo(() => pickState(linkModels$, linkType.id), [linkModels$])
                const options = editorOptions.linkTypes?.[linkType.id] as any ?? {};

                return (
                    <TabsPanel
                        key={linkType.id}
                        id={linkType.id}
                        // menu item props
                        title={linkType.getTitle()}
                        icon={linkType.icon}
                    >
                        <ErrorBoundary errorFallback={ErrorView}>
                            <Editor
                                model$={model$}
                                options={options}
                            />
                            <AdvancedOptions
                                editor={props.editor}
                                form$={props.form$}
                                initialLinkType={props.initialLinkType}
                                linkType={linkType}
                                model$={model$}
                                options={options}
                            />
                        </ErrorBoundary>
                    </TabsPanel>
                )
            })}
        </Tabs>
    );
}
