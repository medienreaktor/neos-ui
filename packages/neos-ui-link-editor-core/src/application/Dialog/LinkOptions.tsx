import * as React from 'react';

import {TextInput, CheckBox} from '@neos-project/react-ui-components';

import {ILinkOptions} from '../../domain';
import {Layout} from '../../presentation';
import {translate} from '@neos-project/neos-ui-i18n';
import {mapState, State} from '@neos-project/framework-observable';
import {FormValues} from './Dialog';
import {useLatestState} from '@neos-project/framework-observable-react';
import style from './style.module.css';

export const LinkOptions: React.FC<{
    form$: State<FormValues>
    enabledLinkOptions: (keyof ILinkOptions)[]
}> = props => {
    const formOptions$ = React.useMemo(() => mapState(props.form$, (form) => form.options), []);
    const formOptions = useLatestState(formOptions$);

    const setTitle = React.useCallback((title) => props.form$.update((values) => ({...values, isOptionsDirty: true, options: {...values.options, title}})), []);
    const setTargetBlank = React.useCallback((targetBlank) => props.form$.update((values) => ({...values, isOptionsDirty: true, options: {...values.options, targetBlank}})), []);
    const setRelNofollow = React.useCallback((relNofollow) => props.form$.update((values) => ({...values, isOptionsDirty: true, options: {...values.options, relNofollow}})), []);
    const setDownload = React.useCallback((download) => props.form$.update((values) => ({...values, isOptionsDirty: true, options: {...values.options, download}})), []);

    return (
        <Layout.Stack>
            {props.enabledLinkOptions.includes('title') ? (
                <label>
                    {translate('Neos.Neos.Ui:LinkEditor.Main:options.label.title', '')}
                    <TextInput type="text" value={formOptions?.title ?? ''} placeholder={translate('Neos.Neos.Ui:LinkEditor.Main:options.placeholder.title', '')} onChange={setTitle} />
                </label>
            ) : null}
            {props.enabledLinkOptions.includes('targetBlank') || props.enabledLinkOptions.includes('relNofollow') || props.enabledLinkOptions.includes('download') ? (
                <div className={style.checkboxColumns}>
                    {props.enabledLinkOptions.includes('targetBlank') ? (
                        <label className={style.checkboxLabel}>
                            <CheckBox onChange={setTargetBlank} isChecked={formOptions?.targetBlank ?? false}/>
                            {translate('Neos.Neos.Ui:LinkEditor.Main:options.label.targetBlank', '')}
                        </label>
                    ) : null}
                    {props.enabledLinkOptions.includes('relNofollow') ? (
                        <label className={style.checkboxLabel}>
                            <CheckBox onChange={setRelNofollow} isChecked={formOptions?.relNofollow ?? false}/>
                            {translate('Neos.Neos.Ui:LinkEditor.Main:options.label.relNofollow', '')}
                        </label>
                    ) : null}
                    {props.enabledLinkOptions.includes('download') ? (
                        <label className={style.checkboxLabel}>
                            <CheckBox onChange={setDownload} isChecked={formOptions?.download ?? false}/>
                            {translate('Neos.Neos.Ui:LinkEditor.Main:options.label.download', '')}
                        </label>
                    ) : null}
                </div>
            ) : null}
        </Layout.Stack>
    );
}
