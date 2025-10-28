import manifest from '@neos-project/neos-ui-extensibility';
import type {I18nRegistry} from './registry';
import {i18nRegistry} from './registry';

manifest('@neos-project/neos-ui-i18n', {}, globalRegistry => {
    globalRegistry.set('i18n', i18nRegistry);
});

declare module '@neos-project/neos-ui-registry' {
    interface GlobalRegistry {
        get(key: 'i18n'): I18nRegistry;
    }
}
