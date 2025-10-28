@flowEntities
Feature: When triggering auto-variation via property set, vary the closest non-tethered ancestor instead

    Background:
        Given using the following content dimensions:
            | Identifier | Values                      | Generalizations                      |
            | example    | general, source, peer, spec | spec->source->general, peer->general |
        And using the following node types:
    """yaml
    'Neos.Neos:Sites':
      superTypes:
        Neos.ContentRepository:Root: true
    'Neos.Neos:Site': []
    'Neos.ContentRepository.Testing:AnotherTethered':
      properties:
        text:
          type: string
    'Neos.ContentRepository.Testing:Tethered':
      childNodes:
        child-tethered:
          type: 'Neos.ContentRepository.Testing:AnotherTethered'
    'Neos.ContentRepository.Testing:Site':
      superTypes:
        Neos.Neos:Site: true
      childNodes:
        tethered:
          type: 'Neos.ContentRepository.Testing:Tethered'
    """
        And using identifier "default", I define a content repository
        And I am in content repository "default"
        And I am user identified by "initiating-user-identifier"
        And the command CreateRootWorkspace is executed with payload:
            | Key                | Value           |
            | workspaceName      | "live"          |
            | newContentStreamId | "cs-identifier" |
        And I am in workspace "live" and dimension space point {"example":"source"}
        And the command CreateRootNodeAggregateWithNode is executed with payload:
            | Key             | Value                    |
            | nodeAggregateId | "lady-eleonode-rootford" |
            | nodeTypeName    | "Neos.Neos:Sites"        |
        And the following CreateNodeAggregateWithNode commands are executed:
            | nodeAggregateId        | nodeTypeName                           | parentNodeAggregateId  | nodeName | tetheredDescendantNodeAggregateIds                                                |
            | sir-david-nodenborough | Neos.ContentRepository.Testing:Site    | lady-eleonode-rootford | site     | {"tethered": "nodewyn-tetherton", "tethered/child-tethered": "nody-mc-nodeface"} |
        And A site exists for node name "site" and domain "http://localhost"
        And the sites configuration is:
            """yaml
            Neos:
              Neos:
                sites:
                  'site':
                    preset: default
                    uriPathSuffix: ''
                    contentDimensions:
                      resolver:
                        factoryClassName: Neos\Neos\FrontendRouting\DimensionResolution\Resolver\NoopResolverFactory
            """

        And the command CreateWorkspace is executed with payload:
            | Key                | Value            |
            | workspaceName      | "user-workspace" |
            | baseWorkspaceName  | "live"           |
            | newContentStreamId | "user-cs-id"     |

    Scenario: Create a variant of a node whose tethered parent is not yet varied
        When I dispatch the following neos-ui change:
        """json
        {
            "type": "Neos.Neos.Ui:Property",
            "subject": "{\"contentRepositoryId\":\"default\",\"workspaceName\":\"user-workspace\",\"dimensionSpacePoint\":{\"example\":\"spec\"},\"aggregateId\":\"nody-mc-nodeface\"}",
            "payload": {
                "propertyName": "text",
                "value": "my variant text"
            }
        }
        """

        When I am in workspace "user-workspace" and dimension space point {"example":"spec"}
        Then I expect node aggregate identifier "sir-david-nodenborough" to lead to node user-cs-id;sir-david-nodenborough;{"example":"spec"}
        And I expect node aggregate identifier "nodewyn-tetherton" to lead to node user-cs-id;nodewyn-tetherton;{"example":"spec"}
        And I expect node aggregate identifier "nody-mc-nodeface" to lead to node user-cs-id;nody-mc-nodeface;{"example":"spec"}
        And I expect this node to have the following properties:
            | Key  | Value           |
            | text | my variant text |

