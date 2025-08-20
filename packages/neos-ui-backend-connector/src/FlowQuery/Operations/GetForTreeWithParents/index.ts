export default () => (nodeTypeFilter = null, usage: 'ALL' | 'PAGE_TREE' = 'ALL') => ({
    type: 'getForTreeWithParents',
    payload: {nodeTypeFilter, usage}
});
