import {Plugin} from '@ckeditor/ckeditor5-core';
import LinkAttributeCommand from './linkAttributeCommand';

const DOWNLOAD = 'linkDownload';

export class LinkDownloadPlugin extends Plugin {
    static get pluginName() {
        return 'LinkDownload';
    }

    init() {
        const {editor} = this;
        editor.model.schema.extend('$text', {allowAttributes: DOWNLOAD});
        editor.conversion.attributeToElement({
            model: DOWNLOAD,
            view: {
                name: 'a',
                attributes: {
                    download: ''
                },
                // the priority has got to be the same as here so the elements would get merged:
                // https://github.com/ckeditor/ckeditor5-link/blob/20e96361014fd13bfb93620f5eb5f528e6b1fe6d/src/utils.js#L33
                priority: 5
            }
        });
        editor.commands.add(DOWNLOAD, new LinkAttributeCommand(this.editor, DOWNLOAD));
    }
}
