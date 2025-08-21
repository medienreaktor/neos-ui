import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash.omit';

import IconButton from '@neos-project/react-ui-components/src/IconButton/';
import LinkButton from './EditorToolbar/LinkButton';
import {neos} from '@neos-project/neos-ui-decorators';
import StyleSelect from './EditorToolbar/StyleSelect';
import RichTextToolbarRegistry from './registry/RichTextToolbarRegistry';

@neos(globalRegistry => ({
    i18nRegistry: globalRegistry.get('i18n')
}))
class IconButtonComponent extends PureComponent {
    static propTypes = {
        i18nRegistry: PropTypes.object,
        tooltip: PropTypes.string
    };

    render() {
        const finalProps = omit(this.props, ['executeCommand', 'formattingRule', 'formattingUnderCursor', 'inlineEditorOptions', 'i18nRegistry', 'tooltip', 'isActive']);
        return (<IconButton {...finalProps} isActive={Boolean(this.props.isActive)} title={this.props.i18nRegistry.translate(this.props.tooltip)} />);
    }
}

//
// Create richtext editing toolbar registry
//
export default ckEditorRegistry => {
    const richtextToolbar = ckEditorRegistry.set('richtextToolbar', new RichTextToolbarRegistry(`
        Contains the Rich Text Editing Toolbar components.

        Buttons in the Rich Text Editing Toolbar are just plain React components.
        The only way for these components to communicate with CKE is via its commands mechanism
        (@see https://docs.ckeditor.com/ckeditor5/latest/framework/guides/architecture/core-editor-architecture.html#commands)
        Some commands may take arguments.
        Commands are provided and handled by CKE plugins. Refer to manifest.config.js to see how to configure custom plugins.

        The values are objects of the following form:

            {
                commandName: 'bold' // A CKE command that gets dispatched
                commandArgs: [arg1, arg2] // Additional arguments passed together with a command
                component: Button // the React component being used for rendering
                isVisible: (editorOptions, formattingUnderCursor) => true // A function that decides is the button should be visible or not
                isActive: (formattingUnderCursor, editorOptions) => true // A function that decides is the button should be active or not
                callbackPropName: 'onClick' // Name of the callback prop of the Component which is fired when the component's value changes
                executeCommand: (command, argument, reFocusEditor = true) => void // An "executeCommand" from the current CKE5 instance
                formattingUnderCursor: {formattingRule: value} // Formatting state under the cursor

                // all other properties are directly passed on to the component.
            }
    `));

    //
    // Configure richtext editing toolbar
    //

    richtextToolbar.set('link', {
        commandName: 'link',
        component: LinkButton,
        isVisible: formattingUnderCursor => formattingUnderCursor?.formatting?.a
    });

    /**
     * Extensible style selector
     */
    richtextToolbar.set('style', {
        component: StyleSelect,
        callbackPropName: 'onSelect',
        isVisible: () => true,
        isActive: () => true
    });

    return richtextToolbar;
};
