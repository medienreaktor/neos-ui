export function isDevelopmentContext(): boolean {
    const systemEnv = document.getElementById('appContainer')?.dataset.env;
    if (!systemEnv) {
        // should not happen
        return true;
    }
    return systemEnv === 'Development' || systemEnv.startsWith('Development/')
}
