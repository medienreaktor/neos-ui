import {upcastLegacyLinkEditorOptions} from './upcastLegacyLinkEditorOptions';

describe('upcastLegacyLinkEditorOptions', () => {
    it('leaves empty case alone', () => {
        expect(
            upcastLegacyLinkEditorOptions(undefined, {linkTypes: {}})
        ).toStrictEqual(
            {
                linkTypes: {}
            }
        );

        expect(
            upcastLegacyLinkEditorOptions({}, {linkTypes: {}})
        ).toStrictEqual(
            {
                linkTypes: {Node: {}, Asset: {}}
            }
        );

        expect(
            // @ts-ignore
            upcastLegacyLinkEditorOptions({placeholder: 'unused'}, {linkTypes: {}})
        ).toStrictEqual(
            {
                linkTypes: {Node: {}, Asset: {}}
            }
        );

        expect(
            // @ts-ignore
            upcastLegacyLinkEditorOptions({}, {linkTypes: {Node: {startingPoint: '/<Foo>'}}})
        ).toStrictEqual(
            {
                linkTypes: {
                    Node: {
                        startingPoint: '/<Foo>'
                    },
                    Asset: {}
                }
            }
        );
    });

    it('adds legacy things', () => {
        expect(
            upcastLegacyLinkEditorOptions(
                {
                    startingPoint: '/<Foo>',
                    nodeTypes: 'Neos.Neos:Document',
                    assets: false,
                    nodes: true
                },
                {linkTypes: {}}
            )
        ).toStrictEqual(
            {
                linkTypes: {
                    Node: {
                        startingPoint: '/<Foo>',
                        baseNodeType: 'Neos.Neos:Document',
                        enabled: true
                    },
                    Asset: {
                        enabled: false
                    }
                }
            }
        );
    });

    it('ignores legacy things when new syntax overrules', () => {
        expect(
            upcastLegacyLinkEditorOptions(
                {
                    startingPoint: '/<Foo>',
                    nodeTypes: 'Neos.Neos:Document',
                    assets: false,
                    nodes: true
                },
                {linkTypes: {
                    Node: {
                        startingPoint: '/<Overruled>',
                        baseNodeType: 'Neos.Neos:Overruled',
                        enabled: false,
                        loadingDepth: 8
                    },
                    Asset: {
                        enabled: true,
                        position: 'end'
                    }
                }}
            )
        ).toStrictEqual(
            {
                linkTypes: {
                    Node: {
                        startingPoint: '/<Overruled>',
                        baseNodeType: 'Neos.Neos:Overruled',
                        enabled: false,
                        loadingDepth: 8
                    },
                    Asset: {
                        enabled: true,
                        position: 'end'
                    }
                }
            }
        );
    });

    it('nodeTypes as array', () => {
        expect(
            upcastLegacyLinkEditorOptions(
                {
                    nodeTypes: ['Neos.Neos:Foo', 'Neos.Neos:Bar']
                },
                {linkTypes: {}}
            )
        ).toStrictEqual(
            {
                linkTypes: {
                    Node: {
                        baseNodeType: 'Neos.Neos:Foo,Neos.Neos:Bar'
                    },
                    Asset: {}
                }
            }
        );
    });
});
