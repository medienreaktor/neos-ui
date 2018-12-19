import React from 'react';
import I18n from '@neos-project/neos-ui-i18n';
import logger from '@neos-project/utils-logger';

/**
 * Checks if the given value is an object or array
 * and its amount is between minimum and maximum
 * specified in the validation options.
 */
const Count = (value, validatorOptions) => {
    const minimum = Math.max(parseInt(validatorOptions.minimum, 10), 0);
    const maximum = Math.min(parseInt(validatorOptions.maximum, 10), Number.MAX_SAFE_INTEGER);

    if (maximum < minimum) {
        logger.error('The maximum is less than the minimum.');
        return 'The maximum is less than the minimum.';
    }

    if (typeof value !== 'object') {
        return <I18n id="content.inspector.validators.countValidator.notCountable"/>;
    }

    const {length} = Object.keys(value);

    if (length === 0) {
        return null;
    }

    if (length < minimum || length > maximum) {
        return <I18n id="content.inspector.validators.countValidator.countBetween" params={{minimum, maximum}}/>;
    }

    return null;
};

export default Count;
