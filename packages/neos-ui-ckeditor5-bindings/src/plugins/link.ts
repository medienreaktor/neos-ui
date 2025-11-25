import {Plugin} from '@ckeditor/ckeditor5-core';
import {LinkEditing} from '@ckeditor/ckeditor5-link';

/** @ts-expect-error */
import LinkTargetBlank from './linkTargetBlank';
/** @ts-expect-error */
import LinkRelNofollow from './linkRelNofollow';
/** @ts-expect-error */
import LinkDownload from './linkDownload';
/** @ts-expect-error */
import LinkTitle from './linkTitle';
import {LinkUi} from './linkUi';

export class Link extends Plugin {
    static get requires() {
        return [LinkEditing, LinkTargetBlank, LinkRelNofollow, LinkDownload, LinkTitle, LinkUi];
    }

    static get pluginName() {
        return 'Link';
    }
}
