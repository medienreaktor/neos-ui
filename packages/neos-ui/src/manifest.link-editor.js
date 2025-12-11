import manifest from '@neos-project/neos-ui-extensibility';

import {registerLinkTypes, registerDialog, createEditor} from '@neos-project/neos-ui-link-editor-core';
import {registerInspectorEditor} from '@neos-project/neos-ui-link-editor-inspector';
import {registerInlineLinkEditor} from '@neos-project/neos-ui-link-editor-inline';

manifest('link-editor', {}, (globalRegistry) => {
    const editor = createEditor();

    registerLinkTypes(globalRegistry);
    registerDialog(globalRegistry, editor);
    registerInspectorEditor(globalRegistry, editor);
    registerInlineLinkEditor(globalRegistry, editor);
});
