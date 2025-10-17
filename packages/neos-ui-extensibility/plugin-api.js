/**
 * This file is the entry point for neos ui plugins. -> Require it via import '@neos-project/neos-ui-extensibility'
 */
import readFromConsumerApi from './dist/readFromConsumerApi';
export default readFromConsumerApi('manifest');
const {SynchronousRegistry, SynchronousMetaRegistry} = readFromConsumerApi('NeosProjectPackages')().NeosUiRegistry;
/**
 * @deprecated legacy code to support `import {SynchronousRegistry} from '@neos-project/neos-ui-extensibility'` please use `import {SynchronousRegistry} from '@neos-project/neos-ui-registry'` instead!
 */
export { SynchronousRegistry, SynchronousMetaRegistry };
