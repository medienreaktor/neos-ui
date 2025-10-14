import {systemEnv} from './system';

export function isDevelopmentContext(): boolean {
    return systemEnv === 'Development' || systemEnv.startsWith('Development/')
}
