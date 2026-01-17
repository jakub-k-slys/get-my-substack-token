@accessibility
Feature: Accessibility
  As a user with accessibility needs
  I want the authentication flow to be accessible
  So that I can use it with assistive technologies

  Background:
    Given I am on the sign in page

  @heading
  Scenario: Proper heading text
    Then the page title should be "Sign in to Substack"

  @focus
  Scenario: Email input is focusable
    Then the "email-input" element should be focusable

  @focus
  Scenario: Submit button is focusable
    Then the "continue-button" element should be focusable

  @keyboard
  Scenario: Support keyboard navigation
    When I focus the "email-input" element
    And I press Tab
    Then the "continue-button" element should be focused

  @aria
  Scenario: Email input indicates invalid state after failed validation
    When I click the continue button
    Then the email input should indicate invalid state
