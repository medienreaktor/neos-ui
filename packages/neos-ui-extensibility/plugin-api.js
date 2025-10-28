/**
 * This file is the entry point for neos ui plugins.
 * Require it via import '@neos-project/neos-ui-extensibility'
 *
 * **Internals**
 * This file wired via the "publishConfig.main" but not used for building the Neos.Ui itself.
 * The internal methods createConsumerApi() and readFromConsumerApi() are this way not exposed to plugins.
 * Also, the readFromConsumerApi() call below to expose the "SynchronousRegistry" does not work in our host code.
 */

import readFromConsumerApi from './dist/readFromConsumerApi';

/**
 * Central function exposed to register a JavaScript package.
 *
 *     import manifest from '@neos-project/neos-ui-extensibility'
 *
 *     manifest('@my-vendor/my-plugin', {}, (globalRegistry, {store}) => {
 *       // ...
 *     })
 */
const manifest = readFromConsumerApi('manifest');
export default manifest;

/**
 * @deprecated legacy code to support `import {SynchronousRegistry} from '@neos-project/neos-ui-extensibility'` please use `import {SynchronousRegistry} from '@neos-project/neos-ui-registry'` instead!
 */
const {SynchronousRegistry, SynchronousMetaRegistry} = readFromConsumerApi('NeosProjectPackages')().NeosUiRegistry;
export { SynchronousRegistry, SynchronousMetaRegistry };
