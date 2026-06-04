Feature: Create new nodes

    Background:
        Given A user with username "admin", password "password" and role "Neos.Neos:Administrator" exists
        And I log in with username "admin" and password "password"

    Scenario: Can create a new page via the document tree
        When I click the "add new page" toolbar button
        And I select the "Page_Test" node type
        And I go back from the node creation dialog
        And I select the "Page_Test" node type
        And I enter "TestPage" as the new node title
        And I confirm the node creation dialog
        Then the rendered page should contain "TestPage" in its navigation

    Scenario: Inline content creation, debounced change requests, and validation
        Given I track content-change requests
        When I add a "Headline_Test" node via the content tree
        And I wait for the change-request debounce to settle
        And I set the last headline's text to "Helloworld!" as a "heading1"
        Then the rendered content collection should contain "Helloworld!"

        When I wait for the change-request debounce to settle
        And I reset the content-change request counter
        And I clear the last headline's text
        And I wait for the change-request debounce to settle
        Then a content-validation tooltip should be visible
        And no content-change request should have been sent

        When I set the last headline's text to "Some text" as a "heading1"
        And I wait for the change-request debounce to settle
        Then a content-change request should have been sent

    Scenario: The creation dialog shows NodeType help when configured
        When I open the inline content creation dialog
        And I click the help icon for the "Headline_Test" node type
        Then the node type help should contain bold text "test"

    Scenario: NodeType items without help have no help icon in the creation dialog
        When I open the inline content creation dialog
        Then the "Text_Test" node type should have no help icon

    Scenario: ClientEval updates dependent SelectBox options in the creation dialog
        When I open the content creation dialog for "NodeWithDependingProperties_Test"
        Then the "dependingProperty" creation dialog select should offer "label_1"
        And the "dependingProperty" creation dialog select should not offer "label_2"
        When I choose "even" in the "propertyDependedOn" creation dialog select
        And I wait for the creation dialog to recalculate
        Then the "dependingProperty" creation dialog select should offer "label_2"
        And the "dependingProperty" creation dialog select should not offer "label_1"

    Scenario: Create an Image node from the content tree
        Given I count the images in the content frame as the baseline
        When I add an "Image_Test" node via the content tree
        And I open the image picker and select the first available media asset
        And I apply the inspector changes
        Then the content frame should contain one more image than the baseline

    Scenario: Inline CKEditor with paragraph:false preserves line breaks without paragraph wrapping
        When I add an "Inline_Headline_Test" node via the content tree
        And I set the last inline headline's raw content to "Foo Bar<br>Bun Buz"
        And I wait for the change-request debounce to settle
        Then the rendered content collection should contain "Foo Bar"
        And the inspector "title" field should show "Foo Bar<br>Bun Buz"

    Scenario: The image editor in the creation dialog syncs the crop result to the inspector
        When I click the "add new page" toolbar button
        And I select the "PageWithImage_Test" node type
        And I enter "TestPage with Image" as the new node title
        And I open the creation dialog image picker and select the first available media asset
        And I crop the image in the creation dialog
        And I confirm the node creation dialog
        Then the inspector image should show the same crop as was applied in the creation dialog

    Scenario: Create a text node inside a container at the correct position
        When I add a "Container_Test" node via the content tree
        And I add a "Text_Test" node into "Container_Test" via the content tree
        Then the "Text_Test" content tree node should be visible
        And the text node should be placed inside the container's inner wrap
        When I set the text node's content to "my text"
        Then the text node in the content frame should contain "my text"
        When I copy the "Container_Test" content tree node and paste it after
        Then there should be 2 "Container_Test" nodes in the content tree
        And there should be 2 "Text_Test" nodes in the content tree
        When I set the last container's text node content to "my copied text"
        Then the last container's text node should contain "my copied text"
        And the first container's text node should contain "my text"
