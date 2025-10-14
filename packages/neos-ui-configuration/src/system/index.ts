import {terminateDueToFatalInitializationError} from '@neos-project/neos-ui-error';

let initialData: Record<string, unknown> | null = null;
function parseInitialData(): Record<string, unknown> {
    if (initialData) {
        return initialData;
    }

    const initialDataContainer = document.getElementById('initialData');
    if (!initialDataContainer) {
        terminateDueToFatalInitializationError(`
            <p>This page is missing a <code>&lt;script/&gt;</code>-container with the
            id <code>#initialData</code>.</p>
        `);
    }

    try {
        const initialDataAsJson = initialDataContainer.innerText;
        initialData = JSON.parse(initialDataAsJson);

        if (typeof initialData === 'object' && initialData) {
            return initialData;
        }

        terminateDueToFatalInitializationError(`
            <p>JSON-content of <code>#initialData</code> has an unexpected
            type: <code>${typeof initialData}</code></p>
        `);
    } catch (err) {
        terminateDueToFatalInitializationError(`
            <p>JSON.parse for content of <code>#initialData</code> failed:
            ${err}</p>
        `);
    }
}

function getInlinedData(dataName: string) {
    const initialData = parseInitialData();

    if (dataName in initialData) {
        return initialData[dataName];
    }

    terminateDueToFatalInitializationError(`
        <p>Initial data for <code>${dataName}</code> could not
        be read from <code>#initialData</code> container.</p>
    `);
}

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

export const serverState = getInlinedData('initialState');

export const configuration = getInlinedData('configuration');

export const nodeTypes = getInlinedData('nodeTypes');

export const frontendConfiguration = getInlinedData('frontendConfiguration');

export const routes = getInlinedData('routes');

export const menu = getInlinedData('menu');
