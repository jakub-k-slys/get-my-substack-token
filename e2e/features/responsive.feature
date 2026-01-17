@responsive
Feature: Responsive Design
  As a user on different devices
  I want the authentication flow to work on all screen sizes
  So that I can authenticate from any device

  @mobile
  Scenario: Mobile viewport displays all elements
    Given I am on the home page
    When I set the viewport to 375x667
    Then the "auth-card" element should be visible
    And the "email-input" element should be visible
    And the "continue-button" element should be visible

  @tablet
  Scenario: Tablet viewport displays all elements
    Given I am on the home page
    When I set the viewport to 768x1024
    Then the "auth-card" element should be visible
    And the "email-input" element should be visible
    And the "continue-button" element should be visible

  @desktop
  Scenario: Desktop viewport displays all elements
    Given I am on the home page
    When I set the viewport to 1920x1080
    Then the "auth-card" element should be visible
    And the "email-input" element should be visible
    And the "continue-button" element should be visible
