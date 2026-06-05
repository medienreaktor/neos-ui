Feature: Document tree search and filter

    Background:
        Given A user with username "admin", password "password" and role "Neos.Neos:Administrator" exists
        And I log in with username "admin" and password "password"

    Scenario: Search and filter the document tree
        When I open the document tree search
        And I search the document tree for "Searchme"
        Then the document tree should contain a node named "Searchme page"
        And the document tree should contain a node named "Searchme shortcut"
        And the document tree should not contain a node named "Not searched page"
        When I filter the document tree by "Shortcut"
        Then the document tree should contain a node named "Searchme shortcut"
        And the document tree should not contain a node named "Searchme page"
        And the document tree should not contain a node named "Not searched page"
        When I clear the document tree search
        Then the document tree should contain a node named "Not searched shortcut"
        And the document tree should not contain a node named "Not searched page"
        When I clear the document tree filter
        Then the document tree should contain a node named "Not searched page"

    Scenario: The search field can be toggled
        Then the document tree search field should be hidden
        When I open the document tree search
        Then the document tree search field should be visible
        When I open the document tree search
        Then the document tree search field should be hidden

    Scenario: The search field state is preserved across page reloads
        When I open the document tree search
        Then the document tree search field should be visible
        When I reload the page
        Then the document tree search field should be visible

    Scenario: The search field toggles via the "t s" hotkey
        Then the document tree search field should be hidden
        When I press the hotkey "t s"
        Then the document tree search field should be visible
