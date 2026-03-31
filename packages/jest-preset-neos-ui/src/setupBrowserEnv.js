import 'regenerator-runtime/runtime';
import browserEnv from 'browser-env';
import 'cross-fetch/polyfill';

browserEnv();

// Provide a minimal #initialData element so that @neos-project/neos-ui-configuration
// can initialise without crashing during test module load.
// jsdom (browser-env) does not implement innerText, so we define it directly on
// the element instance as getInlinedDataFromBackend reads initialDataContainer.innerText.
const initialDataContent = JSON.stringify({
    configuration: {
        nodeTree: {},
        structureTree: {},
        editPreviewModes: {
            inPlace: {isEditingMode: true, isPreviewMode: false, title: 'In-Place'},
            previewMode: {isEditingMode: false, isPreviewMode: true, title: 'Preview Mode'}
        }
    },
    frontendConfiguration: {}
});
const initialDataEl = document.createElement('script');
initialDataEl.id = 'initialData';
initialDataEl.type = 'application/json';
initialDataEl.textContent = initialDataContent;
Object.defineProperty(initialDataEl, 'innerText', {
    get() {
        return this.textContent;
    },
    configurable: true
});
document.head.appendChild(initialDataEl);
