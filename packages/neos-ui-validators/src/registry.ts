import {SynchronousRegistry} from "@neos-project/neos-ui-registry";

type Validator = (
    values: {},
    elementConfigurations: any
) => null | {} | string;

export const validatorRegistry = new SynchronousRegistry<Validator>(`
    Contains all validators.

    The key is a validator name (such as Neos.Neos/Validation/NotEmptyValidator) and the values
    are validator options.
`);

export type ValidatorRegistry = typeof validatorRegistry;
