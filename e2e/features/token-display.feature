@token-display
Feature: Token Display
  As a user who has authenticated
  I want to see and copy my authentication token
  So that I can use it in other applications

  Background:
    Given I am on the sign in page
    When I enter the email "test@example.com"
    And I click the continue button
    And I enter the verification code "123456"
    And I click the continue button
    And I click the skip 2FA button
    Then I should be on the token display step

  @visibility
  Scenario: Token is initially hidden
    Then the token input should have type "password"

  @visibility
  Scenario: Toggle token visibility
    When I click the toggle visibility button
    Then the token input should have type "text"
    When I click the toggle visibility button
    Then the token input should have type "password"

  @copy
  Scenario: Copy token shows feedback
    Given clipboard permissions are granted
    When I click the copy token button
    Then the copy button should show "Copied!"

  @navigation
  Scenario: Start over returns to email step
    When I click the start over button
    Then the page title should be "Sign in to Substack"
    And the "email-input" element should be visible
