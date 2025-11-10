import CkEditorConfigRegistry from './registry/CkEditorConfigRegistry';
import {stripTags} from '@neos-project/utils-helpers';

import DisabledAutoparagraphMode from './plugins/disabledAutoparagraphMode';
import LinkTargetBlank from './plugins/linkTargetBlank';
import LinkRelNofollow from './plugins/linkRelNofollow';
import LinkDownload from './plugins/linkDownload';
import LinkTitle from './plugins/linkTitle';
import ItalicWithEm from './plugins/italicWithEm';

import {icons} from '@ckeditor/ckeditor5-core/src';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BalloonToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/balloon/balloontoolbar';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/linkediting';
import List from '@ckeditor/ckeditor5-list/src/list';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Style from '@ckeditor/ckeditor5-style/src/style';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';

const addPlugin = (Plugin, isEnabled) => (ckEditorConfiguration, options) => {
    // LEGACY: we duplicate editorOptions here so it would be possible to write smth like `$get('formatting.sup')`
    if (!isEnabled || isEnabled(options.editorOptions, options)) {
        return {
            ...ckEditorConfiguration,
            plugins: [
                ...(ckEditorConfiguration.plugins ?? []),
                Plugin
            ]
        };
    }
    return ckEditorConfiguration;
};

// If the editable is a span or a heading, we automatically disable paragraphs and enable the soft break mode
// Also possible to force this behavior with `autoparagraph: false`
const disableAutoparagraph = (editorOptions, {propertyDomNode}) =>
    editorOptions?.autoparagraph === false ||
    propertyDomNode.tagName === 'SPAN' ||
    propertyDomNode.tagName === 'H1' ||
    propertyDomNode.tagName === 'H2' ||
    propertyDomNode.tagName === 'H3' ||
    propertyDomNode.tagName === 'H4' ||
    propertyDomNode.tagName === 'H5' ||
    propertyDomNode.tagName === 'H6';

// Checks if the formatting options contains any block element
const hasBlockFormat = (editorOptions) => {
    if (!editorOptions?.formatting) {
        return false;
    }
    const {formatting} = editorOptions;
    return (
        formatting.h1
        || formatting.h2
        || formatting.h3
        || formatting.h4
        || formatting.h5
        || formatting.h6
        || formatting.p
        || formatting.pre
        || formatting.blockquote
    );
}

//
// Create richtext editing toolbar registry
//
export default ckEditorRegistry => {
    const config = ckEditorRegistry.set('config', new CkEditorConfigRegistry(`
        Contains custom config for CkEditor

        In CKE all things are configured via a single configuration object: plugins, custom configs, etc (@see https://docs.ckeditor.com/ckeditor5/latest/builds/guides/integration/configuration.html)
        This registry allows to register a custom configuration processor that takes a configuration object, modifies it and returns a new one. Example:

        config.set('doSmthWithConfig', ckeConfig => {
            ckeConfig.mySetting = true;
            return ckeConfig;
        });

        The callback function gets passed TWO parameters; aside of the ckeConfig as first parameter, an object
        gets passed in as the second parameter with the following fields:

            - 'editorOptions': gets '[propertyName].ui.inline.editorOptions' from the NodeTypes.yaml
            - 'userPreferences': 'user.preferences' from redux store
            - 'globalRegistry': the global registry
            - 'propertyDomNode': the DOM node where the editor should be initialized.

        Thus, to e.g. only adjust the CKEditor config if a certain formatting option is enabled, you can do the following:

        config.set('doSmthWithConfig', (ckeConfig, {editorOptions}) => {
            if (editorOptions?.formatting.?myCustomField) {
                ckeConfig.mySetting = true;
            }
            return ckeConfig;
        });

        That is all you need to know about configuring CKE in Neos,
        refer to CKEditor 5 documentation for more details on what you can do with it: https://docs.ckeditor.com/ckeditor5/latest/index.html
    `));

    //
    // Base CKE configuration
    // - configuration of language
    // - and placeholder feature see https://ckeditor.com/docs/ckeditor5/16.0.0/api/module_core_editor_editorconfig-EditorConfig.html#member-placeholder
    //
    config.set('baseConfiguration', (ckEditorConfiguration, {globalRegistry, editorOptions, userPreferences}) => {
        const i18nRegistry = globalRegistry.get('i18n');
        const placeholder = editorOptions?.placeholder;
        return {
            ...ckEditorConfiguration,
            // stripTags, because we allow `<p>Edit text here</p>` as placeholder for legacy
            placeholder: placeholder ? stripTags(i18nRegistry.translate(placeholder)) : undefined,
            language: String(userPreferences?.interfaceLanguage),
            licenseKey: 'GPL'
        };
    });

    // General plugins
    config.set('autoformat', addPlugin(Autoformat));
    config.set('essentials', addPlugin(Essentials));
    config.set('removeFormat', addPlugin(RemoveFormat, editorOptions => editorOptions?.formatting?.removeFormat));
    config.set('disabledAutoparagraphMode', addPlugin(DisabledAutoparagraphMode, disableAutoparagraph));

    config.set('bold', addPlugin(Bold, editorOptions => editorOptions?.formatting?.strong));
    config.set('code', addPlugin(Code, editorOptions => editorOptions?.formatting?.code));
    config.set('codeBlock', addPlugin(CodeBlock, editorOptions => editorOptions?.formatting?.code));
    config.set('horizontalLine', addPlugin(HorizontalLine, editorOptions => editorOptions?.formatting?.horizontalLine));
    // Html support (https://ckeditor.com/docs/ckeditor5/latest/features/html/general-html-support.html)
    // is required for the custom styles selector (https://ckeditor.com/docs/ckeditor5/latest/features/style.html)
    // but could also allow additional features, see docs.
    config.set('htmlSupport', addPlugin(GeneralHtmlSupport));
    config.set('italic', addPlugin(Italic, editorOptions => editorOptions?.formatting?.em));
    config.set('paragraph', addPlugin(Paragraph));
    config.set('strikethrough', addPlugin(Strikethrough, editorOptions => editorOptions?.formatting?.strikethrough));
    config.set('style', addPlugin(Style, editorOptions => editorOptions?.formatting?.styleDefinitions));
    config.set('subscript', addPlugin(Subscript, editorOptions => editorOptions?.formatting?.sub));
    config.set('superscript', addPlugin(Superscript, editorOptions => editorOptions?.formatting?.sup));
    config.set('underline', addPlugin(Underline, editorOptions => editorOptions?.formatting?.underline));
    config.set('undo', addPlugin(Undo, editorOptions => editorOptions?.formatting?.undo));

    // Link related plugins
    config.set('link', addPlugin(Link, editorOptions => editorOptions?.formatting?.a));
    config.set('linkTargetBlank', addPlugin(LinkTargetBlank, editorOptions => editorOptions?.formatting?.a));
    config.set('linkRelNofollow', addPlugin(LinkRelNofollow, editorOptions => editorOptions?.formatting?.a));
    config.set('linkDownload', addPlugin(LinkDownload, editorOptions => editorOptions?.formatting?.a));
    config.set('linkTitle', addPlugin(LinkTitle, editorOptions => editorOptions?.formatting?.a));

    // Toolbar plugins
    config.set('balloonToolbar', addPlugin(BalloonToolbar));

    // Table related plugins
    config.set('table', addPlugin(Table, editorOptions => editorOptions?.formatting?.table));
    config.set('tableCaption', addPlugin(TableCaption, editorOptions => editorOptions?.formatting?.table));
    config.set('tableToolbar', addPlugin(TableToolbar, editorOptions => editorOptions?.formatting?.table));

    // List related plugins
    config.set('list', addPlugin(List, editorOptions => (
        editorOptions?.formatting?.ul
        || editorOptions?.formatting?.ol
    )));
    config.set('indent', addPlugin(Indent, editorOptions => editorOptions?.formatting?.indent));
    config.set('alignment', addPlugin(Alignment, editorOptions => (
        editorOptions?.formatting?.left
        || editorOptions?.formatting?.center
        || editorOptions?.formatting?.right
        || editorOptions?.formatting?.justify
    )));
    config.set('heading', addPlugin(Heading, hasBlockFormat));

    // Custom Plugin that automatically converts <i> to <em> for italics
    // @fixes https://github.com/neos/neos-ui/issues/2906
    config.set('italicWithEm', addPlugin(ItalicWithEm, editorOptions => editorOptions?.formatting?.em));

    //
    // @see https://docs.ckeditor.com/ckeditor5/latest/features/headings.html#configuring-heading-levels
    // TODO: Allow custom entries which also allow assigning class names. See docs for details.
    //
    config.set('configureHeadings', config => Object.assign(config, {
        heading: {
            options: [
                {model: 'paragraph', title: 'Paragraph'},
                {model: 'heading1', title: 'Heading 1', view: 'h1'},
                {model: 'heading2', title: 'Heading 2', view: 'h2'},
                {model: 'heading3', title: 'Heading 3', view: 'h3'},
                {model: 'heading4', title: 'Heading 4', view: 'h4'},
                {model: 'heading5', title: 'Heading 5', view: 'h5'},
                {model: 'heading6', title: 'Heading 6', view: 'h6'},
                {model: 'pre', title: 'Preformatted', view: 'pre'},
                {model: 'blockquote', title: 'Blockquote', view: 'blockquote'}
            ]}
    }));

    config.set('configureToolbar', (config, {editorOptions}) => {
        if (!editorOptions?.formatting) {
            return config;
        }
        const {formatting} = editorOptions;
        const toolbarItems = [];

        if (formatting.undo) {
            toolbarItems.push('undo');
            toolbarItems.push('redo');
            toolbarItems.push('|');
        }
        const balloonToolbarItems = [];

        if (formatting.removeFormat) {
            toolbarItems.push('removeFormat');
        }
        if (hasBlockFormat(editorOptions)) {
            toolbarItems.push('heading');
            toolbarItems.push('|');
        }
        if (formatting.strong) {
            balloonToolbarItems.push('bold');
        }
        if (formatting.em) {
            balloonToolbarItems.push('italic');
        }
        if (formatting.sub) {
            balloonToolbarItems.push('subscript');
        }
        if (formatting.sup) {
            balloonToolbarItems.push('superscript');
        }
        if (formatting.underline) {
            balloonToolbarItems.push('underline');
        }
        if (formatting.strikethrough) {
            balloonToolbarItems.push('strikethrough');
        }
        if (formatting.code) {
            balloonToolbarItems.push('code');
            toolbarItems.push('codeBlock');
        }
        if (formatting.ul || formatting.ol) {
            toolbarItems.push('|');
            toolbarItems.push({
                label: 'Lists',
                icon: icons.bulletedList,
                items: [
                    ...(formatting.ul ? ['bulletedList'] : []),
                    ...(formatting.ol ? ['numberedList'] : []),
                    ...(formatting.indent ? ['indent', 'outdent'] : [])
                ]
            });
        }
        if (formatting.left || formatting.center || formatting.right || formatting.justify) {
            toolbarItems.push('alignment');
        }
        if (formatting.horizontalLine) {
            toolbarItems.push('horizontalLine');
        }
        if (formatting.styleDefinitions) {
            toolbarItems.push('style');
        }
        if (formatting.table) {
            toolbarItems.push('insertTable');
        }
        const tableItems = formatting.table ? [
            'tableColumn',
            'tableRow',
            'mergeTableCells',
            'toggleTableCaption'
        ] : [];
        return Object.assign(config, {
            alignment: {
                options: [
                    ...(formatting.left ? ['left'] : []),
                    ...(formatting.center ? ['center'] : []),
                    ...(formatting.right ? ['right'] : []),
                    ...(formatting.justify ? ['justify'] : [])
                ]
            },
            toolbar: {
                items: toolbarItems,
                shouldNotGroupWhenFull: false
            },
            balloonToolbar: {
                items: balloonToolbarItems,
                shouldNotGroupWhenFull: true
            },
            table: {
                contentToolbar: tableItems
            },
            codeBlock: {
                languages: [
                    {language: 'css', label: 'CSS'},
                    {language: 'html', label: 'HTML'}
                ]
            },
            style: {
                definitions: formatting.styleDefinitions || []
            }
        })
    });

    return config;
};
