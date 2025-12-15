import type {NeosUiTestPlugin} from '@neos-project/neos-ui-test-plugin';

/**
 * Separate declaration file to enhance writing tests. If the test is written in ts and the import to neos-ui-test-plugin
 * inlined there, testcafe chokes on that. That's why we use a declaration file far ways from where testcafe will see us.
 */
declare global {
    interface Window {
        neosUiTestPlugin: NeosUiTestPlugin
    }
}
