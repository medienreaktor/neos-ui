import * as React from 'react'
import {IEditor, ILinkType} from '../../../domain';
import {mapState, State} from '@neos-project/framework-observable'
import {useLatestState} from '@neos-project/framework-observable-react'
import mergeClassNames from 'classnames'
import {Button, Icon} from '@neos-project/react-ui-components'
import {translate} from '@neos-project/neos-ui-i18n'
import {LinkOptions} from '../LinkOptions';
import {FormValues} from '../Dialog';
import style from './style.module.css';
import {Layout} from '../../../presentation';

export const AdvancedOptions: React.FC<{
    editor: IEditor,
    form$: State<FormValues>
    initialLinkType?: ILinkType,
    linkType: ILinkType
    model$: State<any>
    options: any
}> = props => {
    const {enabledLinkOptions} = useLatestState(props.editor.state$);

    const formStatus$ = React.useMemo(() => mapState(props.form$, (form) => {
        const isOptionSet = Object.values(form.options ?? {}).some(Boolean);

        return {
            isOptionSet,
            initialLinkWasDeleted: form.initialLinkWasDeleted
        }
    }), []);

    const formStatus = useLatestState(formStatus$);
    const model = useLatestState(props.model$);

    const modelIsDirty = model && props.linkType.isDirty(model);

    const enabled = modelIsDirty || (props.initialLinkType && !formStatus.initialLinkWasDeleted ? props.initialLinkType.id === props.linkType.id : false);

    const isUsed = enabled && (formStatus.isOptionSet || Boolean(model && props.linkType.isAdvanced?.(model)));

    const [isOpen, setOpen] = React.useState<boolean>(false);

    const toggleOpen = React.useCallback(() => enabled ? setOpen(openState => !openState) : null, [enabled]);

    const {AdvancedEditor} = props.linkType;

    if (!enabledLinkOptions.length && !AdvancedEditor) {
        return null;
    }

    const classNames = mergeClassNames({
        [style.advancedButton]: true,
        [style.advancedButtonIsOpen]: isOpen
    });

    return <div className={style.advanced}>
        <Button disabled={!enabled} style="lighter" hoverStyle="brand" className={classNames} onClick={toggleOpen}>
            <Icon icon="cogs" color={isUsed ? 'primaryBlue' : undefined} padded="right"/>
            {translate('Neos.Neos.Ui:LinkEditor.Main:options.title', 'Advanced')}
            <Icon icon={isOpen ? 'chevron-left' : 'chevron-right'} padded="left"/>
        </Button>
        {
            isOpen ? (
                <div className={style.advancedContents}>
                    <Layout.Stack>
                        {AdvancedEditor
                            ? <AdvancedEditor model$={props.model$} options={props.options} />
                            : null}
                        <LinkOptions
                            form$={props.form$}
                            enabledLinkOptions={enabledLinkOptions}
                        />
                    </Layout.Stack>
                </div>
            ) : null
        }
    </div>
};
