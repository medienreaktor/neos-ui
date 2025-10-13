import type {GlobalRegistry} from '@neos-project/neos-ui-registry';
import createConsumerApi from './createConsumerApi';
import readFromConsumerApi from './readFromConsumerApi';

type BootstrapDependencies = {
    // correct store type depends on https://github.com/neos/neos-ui/pull/4010
    store: any;
    frontendConfiguration: Record<string, unknown>;
    configuration: Record<string, unknown>;
    routes: Record<string, unknown>;
};

type Bootstrap = (
    globalRegistry: GlobalRegistry,
    bootstrapDependencies: BootstrapDependencies
) => void;

const manifest: (
    identifier: string,
    // the age-old commit a2dae5b78a649ad75643f48b02b6df67f5915a58 introduced this parameter "options" though we not make use of it
    options: {},
    bootstrap: Bootstrap
) => void = readFromConsumerApi('manifest');

export default manifest;

export {
    createConsumerApi,
    readFromConsumerApi
};
