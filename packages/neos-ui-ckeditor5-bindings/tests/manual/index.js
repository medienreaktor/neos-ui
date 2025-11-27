import initializeConfigRegistry from '../../src/manifest.config';
import {bootstrap, createEditor} from '../../src/ckEditorApi';

import {SynchronousRegistry, SynchronousMetaRegistry} from '@neos-project/neos-ui-registry';
import {setupI18n} from '@neos-project/neos-ui-i18n';

const fakeGlobalRegistry = new SynchronousMetaRegistry();

// I18n Registry
class FakeI18NRegistry extends SynchronousRegistry {
    translate(key) {
        return key;
    }
}
fakeGlobalRegistry.set('i18n', new FakeI18NRegistry());

setupI18n('en-US', 'one,other', {});

document.getElementById('ckVersion').innerText = CKEDITOR_VERSION;

const configRegistry = initializeConfigRegistry(new SynchronousRegistry());

const editorOptions = {
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
};

bootstrap({
    setFormattingUnderCursor: () => {
        document.getElementById('enabledCommands').innerText = [...window.editor.commands.names()].join(', ')
    },
    setCurrentlyEditedPropertyName: () => {},
    toolbarItems: [],
    configRegistry
})

const createInlineEditor = createEditor();


// test in host frame
if (false) {
    createInlineEditor({
        propertyDomNode: document.getElementById('input'),
        propertyName: 'test',
        editorOptions,
        globalRegistry: fakeGlobalRegistry,
        userPreferences: {},
        onChange: (content) => {
            document.getElementById('output').innerText = content;
        }
    }).then(editor => {
        window.editor = editor
    })
}

// test in guest frame
const iframeDocument = document.querySelector('iframe[name="neos-content-main"]')?.contentDocument;

if (iframeDocument) {
    // if is defined and accessible via content security (must be launched via sever instead of file in browser)
    createInlineEditor({
        propertyDomNode: iframeDocument.getElementById('input'),
        propertyName: 'test',
        editorOptions,
        globalRegistry: fakeGlobalRegistry,
        userPreferences: {},
        onChange: (content) => {
            iframeDocument.getElementById('output').innerText = content;
        }
    }).then(editor => {
        document.querySelector('iframe[name="neos-content-main"]').contentWindow.editor = editor
    })
}

