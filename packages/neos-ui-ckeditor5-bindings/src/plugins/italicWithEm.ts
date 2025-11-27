import {Plugin} from '@ckeditor/ckeditor5-core';

// same as ItalicEditing Plugin from CKEditor5
const ITALIC = 'italic';

/**
 * Custom Plugin to replace <i> with <em> tags.
 * @fixes https://github.com/neos/neos-ui/issues/2906
 *
 * Original Italic Plugin at '@ckeditor/ckeditor5-basic-styles/src/italic/italicediting.js'
 */
export class ItalicWithEm extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'ItalicWithEm';
    }

    /**
     * @inheritDoc
     */
    init() {
        this.editor.conversion.for('downcast').attributeToElement({
            model: ITALIC,
            view: 'em',
            converterPriority: 'high'
        });
    }
}
