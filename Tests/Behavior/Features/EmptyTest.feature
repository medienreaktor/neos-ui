Feature: Empty Test so the CI doesnt fail as there are no others

    Background:
        Given using the following content dimensions:
            | Identifier | Values      | Generalizations |
            | language   | de, en, gsw | gsw->de, en     |
        And using the following node types:
        """yaml
        'Neos.Neos:Sites':
          superTypes:
            'Neos.ContentRepository:Root': true
        """
        And using identifier "default", I define a content repository
        And I am in content repository "default"

    Scenario:
        And the command CreateRootWorkspace is executed with payload:
            | Key                | Value           |
            | workspaceName      | "live"          |
            | newContentStreamId | "cs-identifier" |
        And I am in workspace "live" and dimension space point {"language": "en"}
        And the command CreateRootNodeAggregateWithNode is executed with payload:
            | Key             | Value             |
            | nodeAggregateId | "sites"           |
            | nodeTypeName    | "Neos.Neos:Sites" |
