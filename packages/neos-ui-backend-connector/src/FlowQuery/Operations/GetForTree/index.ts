export default () => (usage: 'ALL' | 'PAGE_TREE' = 'ALL') => ({
    type: 'getForTree',
    payload: {usage}
});
