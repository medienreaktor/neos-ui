import manifest from '@neos-project/neos-ui-extensibility';

import {registerLinkTypes, registerDialog, editor} from '@neos-project/neos-ui-link-editor-core';
import {registerInspectorEditors} from '@neos-project/neos-ui-link-editor-inspector';
import {registerLinkButton} from '@neos-project/neos-ui-link-editor-inline';

manifest('link-editor', {}, (globalRegistry) => {
    registerLinkTypes(globalRegistry);
    registerDialog(globalRegistry, editor);
    registerInspectorEditors(globalRegistry, editor);
    // todo remove registerLinkButton(globalRegistry, editor);
});
