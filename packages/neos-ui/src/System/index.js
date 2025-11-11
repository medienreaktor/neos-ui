import {terminateDueToFatalInitializationError} from '@neos-project/neos-ui-error';

export const appContainer = document.getElementById('appContainer');
if (!appContainer) {
    terminateDueToFatalInitializationError(`
        <p>This page is missing a container with the id <code>#appContainer</code>.</p>
    `);
}

/**
 * Initial CSRF token - this value is not updated during re-login -> see fetchWithErrorHandling instead
 */
if (!appContainer.dataset.csrfToken) {
    terminateDueToFatalInitializationError(`
        <p>The container with the id <code>#appContainer</code> is missing an attribute
        <code>data-csrf-token</code>.</p>
    `);
}
export const {csrfToken} = appContainer.dataset;

if (!appContainer.dataset.env) {
    terminateDueToFatalInitializationError(`
        <p>The container with the id <code>#appContainer</code> is missing an attribute
        <code>data-env</code> (eg. Production, Development, etc...).</p>
    `);
}
export const {env: systemEnv} = appContainer.dataset;
