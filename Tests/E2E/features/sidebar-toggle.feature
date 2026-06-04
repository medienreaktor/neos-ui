Feature: Toggle backend sidebars

    Background:
        Given A user with username "admin", password "password" and role "Neos.Neos:Administrator" exists
        And I log in with username "admin" and password "password"

    Scenario: Toggle the left sidebar
        Then the "left" sidebar should be visible
        When I toggle the "left" sidebar
        Then the "left" sidebar should be hidden
        When I toggle the "left" sidebar
        Then the "left" sidebar should be visible

    Scenario: Toggle the right sidebar
        Then the "right" sidebar should be visible
        When I toggle the "right" sidebar
        Then the "right" sidebar should be hidden
        When I toggle the "right" sidebar
        Then the "right" sidebar should be visible
