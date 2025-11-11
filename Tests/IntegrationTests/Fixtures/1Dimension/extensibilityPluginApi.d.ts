import type {NeosUiTestPlugin} from '@neos-project/neos-ui-test-plugin';

/**
 * Separate declaration file to enhance writing tests. If the test is transformed to ts and the import to neos-ui-test-plugin
 * inlined there, testcafe chokes on that.
 */
declare global {
    interface Window {
        neosUiTestPlugin: NeosUiTestPlugin
    }
}
