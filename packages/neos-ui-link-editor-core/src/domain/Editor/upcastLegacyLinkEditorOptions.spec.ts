import {upcastLegacyLinkEditorOptions} from './upcastLegacyLinkEditorOptions';

describe('upcastLegacyLinkEditorOptions', () => {
    it('leaves empty case alone', () => {
        expect(
            upcastLegacyLinkEditorOptions(undefined)
        ).toStrictEqual(
            {
                linkTypes: {}
            }
        );

        expect(
            upcastLegacyLinkEditorOptions({})
        ).toStrictEqual(
            {
                linkTypes: {Node: {}, Asset: {}}
            }
        );

        expect(
            // @ts-ignore
            upcastLegacyLinkEditorOptions({placeholder: 'unused'})
        ).toStrictEqual(
            {
                linkTypes: {Node: {}, Asset: {}}
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
                }
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

    it('nodeTypes as array', () => {
        expect(
            upcastLegacyLinkEditorOptions(
                {
                    nodeTypes: ['Neos.Neos:Foo', 'Neos.Neos:Bar']
                }
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
