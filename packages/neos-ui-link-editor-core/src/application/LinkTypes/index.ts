import {SynchronousRegistry} from '@neos-project/neos-ui-registry';

import {Web} from './Web';
import {Node} from './Node';
import {Asset} from './Asset';
import {MailTo} from './MailTo';
import {Phone} from './Phone';
import {GlobalRegistry} from '@neos-project/neos-ui-registry';
import {ILinkType} from '../../domain';

export function registerLinkTypes(globalRegistry: GlobalRegistry): void {
    const linkTypeRegistry = new SynchronousRegistry(`
        # LinkEditor LinkType Registry
    `);

    linkTypeRegistry.set(Web.id, Web);
    linkTypeRegistry.set(Node.id, Node);
    linkTypeRegistry.set(Asset.id, Asset);
    linkTypeRegistry.set(MailTo.id, MailTo);
    linkTypeRegistry.set(Phone.id, Phone);

    globalRegistry.set('@neos-project/neos-ui-link-editor/link-types', linkTypeRegistry);
}

declare module '@neos-project/neos-ui-registry' {
    interface GlobalRegistry {
        get(key: '@neos-project/neos-ui-link-editor/link-types'): SynchronousRegistry<ILinkType>;
    }
}
