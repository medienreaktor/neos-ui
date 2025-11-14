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

export function getInlinedDataFromBackend(dataName: string) {
    const initialData = parseInitialData();

    if (dataName in initialData) {
        return initialData[dataName];
    }

    terminateDueToFatalInitializationError(`
        <p>Initial data for <code>${dataName}</code> could not
        be read from <code>#initialData</code> container.</p>
    `);
}
