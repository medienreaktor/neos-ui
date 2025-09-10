import {useNeos} from './NeosContext';
import {GlobalRegistry} from '@neos-project/neos-ui-registry';

export function useGlobalRegistry(): GlobalRegistry {
    const neos = useNeos();
    return neos.globalRegistry;
}
