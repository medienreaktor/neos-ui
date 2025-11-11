import {getInlinedDataFromBackend} from '@neos-project/neos-ui-configuration/src/bootstrap';
import {nodeTypesRegistry} from './NodeTypesRegistry';

const LINK_ID_FOR_SCHEMA_NODE_TYPE_ROUTE = 'neos-ui-uri:/neos/schema/node-type.json';

const nodeTypeGroupsAndRoles = getInlinedDataFromBackend('nodeTypeGroupsAndRoles') as {
    groups: {
        [id: string]: {
            position?: number | string,
            label: string,
            collapsed: boolean
        },
    }
    roles: {
        ignored: 'unstructured',
        document: 'Neos.Neos:Document',
        content: 'Neos.Neos:Content',
        contentCollection: 'Neos.Neos:ContentCollection',
        [id: string]: string
    }
};

export async function initializeNodeTypesRegistry() {
    const link = getLinkTag();
    const href = getHrefFromLinkTag(link);

    const response = await fetch(href.toString(), {credentials: 'include'});
    const nodeTypesSchema = await response.json();

    Object.keys(nodeTypesSchema.nodeTypes).forEach(nodeTypeName => {
        nodeTypesRegistry.set(nodeTypeName, {
            ...nodeTypesSchema.nodeTypes[nodeTypeName],
            name: nodeTypeName
        });
    });

    nodeTypesRegistry.setConstraints(nodeTypesSchema.constraints);
    nodeTypesRegistry.setInheritanceMap(nodeTypesSchema.inheritanceMap);

    const {groups, roles} = nodeTypeGroupsAndRoles;
    nodeTypesRegistry.setGroups(groups);
    nodeTypesRegistry.setRoles(roles);
}

function getLinkTag() {
    const link = document.getElementById(LINK_ID_FOR_SCHEMA_NODE_TYPE_ROUTE);
    if (link === null || !(link instanceof HTMLLinkElement)) {
        throw NodeTypesRegistryCouldNotBeInitialized
            .becauseRouteLinkCouldNotBeFound();
    }
    return link;
}

function getHrefFromLinkTag(link: HTMLLinkElement): URL {
    const href = link?.getAttribute('href');
    if (href === null) {
        throw NodeTypesRegistryCouldNotBeInitialized
            .becauseRouteLinkHasNoHref();
    }

    try {
        return new URL(href);
    } catch {
        throw NodeTypesRegistryCouldNotBeInitialized
            .becauseRouteLinkHrefIsNotAValidURL(href);
    }
}

export class NodeTypesRegistryCouldNotBeInitialized extends Error {
    private constructor(message: string) {
        super(`NodeTypesRegistry could not be initialized, because ${message}`);
    }

    public static becauseRouteLinkCouldNotBeFound = () =>
        new NodeTypesRegistryCouldNotBeInitialized(
            `this document has no <link>-Tag with id "${LINK_ID_FOR_SCHEMA_NODE_TYPE_ROUTE}".`
        );

    public static becauseRouteLinkHasNoHref = () =>
        new NodeTypesRegistryCouldNotBeInitialized(
            `the found <link>-Tag with id "${LINK_ID_FOR_SCHEMA_NODE_TYPE_ROUTE}" is`
            + ` missing an "href"-attribute.`
        );

    public static becauseRouteLinkHrefIsNotAValidURL = (attemptedValue: string) =>
        new NodeTypesRegistryCouldNotBeInitialized(
            `the "href"-attribute of the <link>-Tag with id "${LINK_ID_FOR_SCHEMA_NODE_TYPE_ROUTE}"`
            + ` must be a valid, absolute URL, but was "${attemptedValue}".`
        );
}
