Feature: When automatically creating a variant of a node with a tethered parent that does not cover the requested DSP

    Background:
        Given using the following content dimensions:
            | Identifier | Values                      | Generalizations                      |
            | example    | general, source, peer, spec | spec->source->general, peer->general |
        And using the following node types:
    """yaml
    'Neos.ContentRepository.Testing:AnotherTethered': []
    'Neos.ContentRepository.Testing:Tethered':
      childNodes:
        child-tethered:
          type: 'Neos.ContentRepository.Testing:AnotherTethered'
    'Neos.ContentRepository.Testing:Document':
      childNodes:
        tethered:
          type: 'Neos.ContentRepository.Testing:Tethered'
    'Neos.ContentRepository.Testing:Content':
      properties:
        text:
          type: string
    """
        And using identifier "default", I define a content repository
        And I am in content repository "default"
        And I am user identified by "initiating-user-identifier"
        And the command CreateRootWorkspace is executed with payload:
            | Key                | Value           |
            | workspaceName      | "live"          |
            | newContentStreamId | "cs-identifier" |
        And I am in workspace "live" and dimension space point {"example":"general"}
        And the command CreateRootNodeAggregateWithNode is executed with payload:
            | Key             | Value                         |
            | nodeAggregateId | "lady-eleonode-rootford"      |
            | nodeTypeName    | "Neos.ContentRepository:Root" |
        And the following CreateNodeAggregateWithNode commands are executed:
            | nodeAggregateId        | nodeTypeName                            | parentNodeAggregateId  | nodeName       | tetheredDescendantNodeAggregateIds                                         |
            | sir-david-nodenborough | Neos.ContentRepository.Testing:Document | lady-eleonode-rootford | document       | {"tethered": "nodewyn-tetherton", "tethered/child-tethered": "nodimer-tetherton"} |
            | nody-mc-nodeface       | Neos.ContentRepository.Testing:Content  | nodimer-tetherton      | child-document | {}                                                                         |
        And the command CreateWorkspace is executed with payload:
            | Key                | Value            |
            | workspaceName      | "user-workspace" |
            | baseWorkspaceName  | "live"           |
            | newContentStreamId | "user-cs-id"     |
        And the following Neos users exist:
            | Username              | First name | Last name  | Roles                                                     |
            | editor                 | Peter-Klaus      | Fledermaus      | Neos.Neos:Editor                                   |
        And content repository security is enabled
        And the role MANAGER is assigned to workspace "user-workspace" for user "editor"

    Scenario: Create a variant of a node whose tethered parent is not yet varied
        When I dispatch the following neos-ui change:
        """json
        {
            "type": "Neos.Neos.Ui:Property",
            "subject": "{\"contentRepositoryId\":\"default\",\"workspaceName\":\"user-workspace\",\"dimensionSpacePoint\":{\"example\":\"spec\"},\"aggregateId\":\"nody-mc-nodeface\"}",
            "payload": {
                "propertyName": "text",
                "value": "my variant text",
                "nodeDomAddress": {
                    "contextPath": "{\"contentRepositoryId\":\"default\",\"workspaceName\":\"user-workspace\",\"dimensionSpacePoint\":{\"example\":\"spec\"},\"aggregateId\":\"nody-mc-nodeface\"}",
                    "fusionPath": "RenderingUseCase::CONTENT"
                }
            }
        }
        """

        When I am in dimension space point {"example":"spec"}
        Then I expect node aggregate identifier "sir-david-nodenborough" to lead to node user-cs-id;sir-david-nodenborough;{"example":"spec"}
        And I expect node aggregate identifier "nodewyn-tetherton" to lead to node user-cs-id;nodewyn-tetherton;{"example":"spec"}
        And I expect node aggregate identifier "nodimer-tetherton" to lead to node user-cs-id;nodimer-tetherton;{"example":"spec"}
        And I expect node aggregate identifier "nody-mc-nodeface" to lead to node user-cs-id;nody-mc-nodeface;{"example":"spec"}
        And I expect this node to have the following properties:
            | Key  | Value           |
            | text | my variant text |

