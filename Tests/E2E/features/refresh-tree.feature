Feature: Refresh document tree

    Background:
        Given A user with username "admin", password "password" and role "Neos.Neos:Administrator" exists
        And I log in with username "admin" and password "password"

    Scenario: Inspector remains functional after refreshing the document tree
        Then the inspector "title" field should show "Home"
        When I refresh the document tree
        And I set the inspector "title" field to "Home is good"
        And I apply the inspector changes
        Then the inspector "title" field should show "Home is good"
