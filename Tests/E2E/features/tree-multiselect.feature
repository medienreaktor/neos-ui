Feature: Move multiple document tree nodes at once

    The "Tree multiselect" page in the test site has four child pages MultiA-D as
    siblings. These scenarios verify that selecting several siblings and then
    moving them — via the toolbar (cut + paste) or via drag-and-drop — re-parents
    all selected nodes correctly.

    Background:
        Given A user with username "admin", password "password" and role "Neos.Neos:Administrator" exists
        And I log in with username "admin" and password "password"

    Scenario: Move multiple nodes via the toolbar (cut + paste)
        When I select the "MultiB" tree node
        And I also select the "MultiD" tree node via ctrl-click
        And I cut the selected tree nodes
        And I select the "MultiA" tree node
        And I paste the clipboard into the selected tree node
        Then the "MultiB" tree node should be nested under "MultiA"
        And the "MultiD" tree node should be nested under "MultiA"

    Scenario: Move multiple nodes via drag-and-drop with ctrl-click
        When I select the "MultiB" tree node
        And I also select the "MultiD" tree node via ctrl-click
        And I drag the "MultiD" tree node onto the "MultiA" tree node
        Then the "MultiB" tree node should be nested under "MultiA"
        And the "MultiD" tree node should be nested under "MultiA"

    Scenario: Move multiple nodes via drag-and-drop with shift-click range
        When I select the "MultiB" tree node
        And I also select the "MultiD" tree node via shift-click
        And I drag the "MultiC" tree node onto the "MultiA" tree node
        Then the "MultiB" tree node should be nested under "MultiA"
        And the "MultiC" tree node should be nested under "MultiA"
        And the "MultiD" tree node should be nested under "MultiA"
