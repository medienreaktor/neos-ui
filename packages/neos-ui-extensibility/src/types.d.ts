
/**
 * Dedicated types declaration as we cannot bundle the types GlobalRegistry, Configuration correctly for distributing "neos-ui-extensibility" via NMP
 * This file is not published.
 */
declare module '@neos-project/neos-ui-extensibility' {
    import type {GlobalRegistry} from '@neos-project/neos-ui-registry';
    import type {Configuration} from '@neos-project/neos-ui-configuration';
    import type {Routes} from '@neos-project/neos-ui-backend-connector';

    type BootstrapDependencies = {
        // correct store type depends on https://github.com/neos/neos-ui/pull/4010
        store: any;
        /** @deprecated use "import {getFrontendConfigurationForPackage} from '@neos-project/neos-ui-configuration'" instead */
        frontendConfiguration: Record<string, any>;
        /** @deprecated use "import {getConfiguration} from '@neos-project/neos-ui-registry'" instead */
        configuration: Configuration;
        routes: Routes;
    };

    type Bootstrap = (
        globalRegistry: GlobalRegistry,
        bootstrapDependencies: BootstrapDependencies
    ) => void;

    export default function manifest(
        identifier: string,
        // the age-old commit a2dae5b78a649ad75643f48b02b6df67f5915a58 introduced this parameter "options" though we not make use of it
        options: {},
        bootstrap: Bootstrap
    ): void;
}
