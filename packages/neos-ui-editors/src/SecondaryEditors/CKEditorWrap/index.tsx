import React, {useCallback, useEffect, useRef, useState} from 'react';
import {DecoupledEditor} from '@ckeditor/ckeditor5-editor-decoupled';
// @ts-ignore
import debounce from 'lodash.debounce';

import {neos} from '@neos-project/neos-ui-decorators';
// @ts-ignore
import {EditorToolbar} from '@neos-project/neos-ui-ckeditor5-bindings/src/EditorToolbar';
import {useSelector} from '@neos-project/neos-ui-redux-store';
import {GlobalRegistry} from '@neos-project/neos-ui-registry';
// @ts-ignore
import {CkEditorConfigRegistry} from '@neos-project/neos-ui-ckeditor5-bindings/src/registry/CkEditorConfigRegistry';

import style from './index.module.css';

const withNeosGlobals = neos((globalRegistry) => ({
    globalRegistry,
    // @ts-ignore
    configRegistry: globalRegistry.get('ckEditor5').get('config')
}));

type CKEditorWrapProps = {
    onChange: (value: string) => void,
    value: string,
    options: object,
    configRegistry: CkEditorConfigRegistry,
    globalRegistry: GlobalRegistry
}

const CKEditorWrap: React.FC<CKEditorWrapProps> = ({
                                                       onChange,
                                                       value,
                                                       options,
                                                       configRegistry,
                                                       globalRegistry
                                                   }) => {
    const userPreferences = useSelector(state => state?.user?.preferences);
    const [formattingUnderCursor, setFormattingUnderCursor] = useState({});
    const [lastFormattingUnderCursorSerialized, setLastFormattingUnderCursorSerialized] = useState('');
    const editorRef = useRef<HTMLDivElement>(null);
    const [currentEditor, setCurrentEditor] = useState<DecoupledEditor>();

    const executeCommand = useCallback((command, argument, reFocusEditor = true) => {
        if (!currentEditor) {
            return;
        }
        currentEditor.execute(command, argument);
        if (reFocusEditor) {
            currentEditor.editing.view.focus();
        }
    }, [currentEditor]);

    const handleUserInteractionCallback = useCallback(() => {
        if (!currentEditor) {
            return;
        }
        const newFormattingUnderCursor: Record<string, any> = {};
        [...currentEditor.commands].forEach(commandTuple => {
            const [commandName, command] = commandTuple;
            if (command.value !== undefined) {
                newFormattingUnderCursor[commandName] = command.value;
            }
        });

        const formattingUnderCursorSerialized = JSON.stringify(newFormattingUnderCursor);
        if (formattingUnderCursorSerialized !== lastFormattingUnderCursorSerialized) {
            setFormattingUnderCursor(newFormattingUnderCursor);
            setLastFormattingUnderCursorSerialized(formattingUnderCursorSerialized);
        }
    }, []);

    useEffect(() => {
        if (!editorRef.current || currentEditor) {
            return;
        }
        const domNode = editorRef.current;

        const ckeConfig = configRegistry.getCkeditorConfig({
            editorOptions: options,
            userPreferences,
            globalRegistry,
            propertyDomNode: domNode
        });

        DecoupledEditor
            .create(domNode, {
                ...ckeConfig,
                initialData: value
            })
            .then(editor => {
                setCurrentEditor(editor);

                // As we use the DecoupledEditor, we need to add the toolbar to the secondary editor
                if (editorRef.current) {
                    editorRef.current.before(editor.ui.view.toolbar.element as Node);
                }

                editor.model.document.on('change', handleUserInteractionCallback);
                editor.model.document.on('change:data', debounce(() => onChange(editor.getData()), 200, {maxWait: 3000}));
            }).catch(e => console.error(e));
    }, [editorRef.current]);

    return (
        <div className={style.wrap}>
            <div className={style.toolBar__wrap}>
                <EditorToolbar
                    executeCommand={executeCommand}
                    editorOptions={options}
                    formattingUnderCursor={formattingUnderCursor}
                />
            </div>
            <div ref={editorRef} className={style.editor}/>
        </div>
    );
}

export default React.memo(withNeosGlobals(CKEditorWrap as any));
