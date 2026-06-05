Feature: Inspector validation

    The inspector renders a validation badge on its tabs when required properties
    are empty. The badge displays the count of validation errors in that tab.

    Background:
        Given A user with username "admin", password "password" and role "Neos.Neos:Administrator" exists
        And I log in with username "admin" and password "password"

    Scenario: Removing the homepage title shows one validation error
        When I clear the inspector "title" field
        Then the inspector "title" field should show ""
        And the active inspector tab should show 1 validation error

    Scenario: Removing both title and URI path segment shows two validation errors
        When I navigate to the "Discarding" page
        And I clear the inspector "title" field
        And I clear the inspector "uriPathSegment" field
        Then the active inspector tab should show 2 validation errors

    Scenario: Resolving a validation error clears the badge
        When I clear the inspector "title" field
        Then the active inspector tab should show 1 validation error
        When I set the inspector "title" field to "Home"
        Then the active inspector tab should show no validation errors
