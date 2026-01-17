@complete-flow
Feature: Complete Authentication Flow
  As a Substack user
  I want to complete the full authentication flow
  So that I can obtain my authentication token

  Background:
    Given I am on the sign in page

  @smoke @happy-path
  Scenario: Complete authentication with 2FA
    When I enter the email "test@example.com"
    And I click the continue button
    Then I should proceed to the verification step
    And I should see my email displayed as "test@example.com"
    When I enter the verification code "123456"
    And I click the continue button
    Then I should be on the two-factor authentication step
    When I enter the 2FA code "123456"
    And I click the confirm button
    Then I should be on the token display step
    And I should see the token message
    And I should see the copy token button

  @smoke
  Scenario: Complete authentication skipping 2FA
    When I enter the email "test@example.com"
    And I click the continue button
    Then I should proceed to the verification step
    When I enter the verification code "123456"
    And I click the continue button
    Then I should be on the two-factor authentication step
    When I click the skip 2FA button
    Then I should be on the token display step

  @token
  Scenario: Copy token to clipboard
    Given clipboard permissions are granted
    When I enter the email "test@example.com"
    And I click the continue button
    And I enter the verification code "123456"
    And I click the continue button
    And I click the skip 2FA button
    Then I should be on the token display step
    When I click the copy token button
    Then the copy button should show "Copied!"

  @navigation
  Scenario: Start over from token display
    When I enter the email "test@example.com"
    And I click the continue button
    And I enter the verification code "123456"
    And I click the continue button
    And I click the skip 2FA button
    Then I should be on the token display step
    When I click the start over button
    Then the page title should be "Sign in to Substack"
    And the "email-input" element should be visible
