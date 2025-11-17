import initializeConfigRegistry from '../../src/manifest.config';
import {bootstrap, createEditor} from '../../src/ckEditorApi';

import {SynchronousRegistry, SynchronousMetaRegistry} from '@neos-project/neos-ui-registry';

const fakeGlobalRegistry = new SynchronousMetaRegistry();

// I18n Registry
class FakeI18NRegistry extends SynchronousRegistry {
    translate(key) {
        return key;
    }
}
fakeGlobalRegistry.set('i18n', new FakeI18NRegistry());

const configRegistry = initializeConfigRegistry(new SynchronousRegistry());

bootstrap({
    setFormattingUnderCursor: () => {
        document.getElementById('enabledCommands').innerText = [...window.editor.commands.names()].join(', ')
    },
    setCurrentlyEditedPropertyName: () => {},
    toolbarItems: [],
    configRegistry
})

const fakeStore = {
    dispatch: () => {}
}

const createInlineEditor = createEditor(fakeStore);

createInlineEditor({
    propertyDomNode: document.getElementById('input'),
    propertyName: 'test',
    editorOptions: {
        autoparagraph: true,
        formatting: {
            splitAdd: true,
            strong: true,
            em: true,
            underline: true,
            sub: true,
            sup: true,
            indent: true,
            p: true,
            h1: true,
            h2: true,
            h3: true,
            h4: true,
            h5: true,
            pre: true,
            table: true,
            a: true,
            ul: true,
            ol: true,
            left: true,
            right: true,
            center: true,
            justify: true,
            removeFormat: true,
            code: true,
            horizontalLine: true,
            styleDefinitions: [
                {
                    name: 'Lead',
                    element: 'p',
                    classes: ['lead'],
                },
                {
                    name: 'Animated',
                    element: 'p',
                    classes: ['animated'],
                },
                {
                    name: 'Highlight',
                    element: 'span',
                    classes: ['highlight'],
                },
                {
                    name: 'Mark',
                    element: 'mark',
                    classes: ['mark'],
                },
            ]
        }
    },
    globalRegistry: fakeGlobalRegistry,
    userPreferences: {},
    onChange: (content) => {
        document.getElementById('output').innerText = content;
    }
}).then(editor => {
    document.getElementById('ckVersion').innerText = CKEDITOR_VERSION;

    window.editor = editor
})
