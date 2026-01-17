@verification-step
Feature: Verification Step
  As a user
  I want to enter a verification code
  So that I can prove I own the email address

  Background:
    Given I am on the sign in page
    When I enter the email "test@example.com"
    And I click the continue button
    Then I should proceed to the verification step

  @auto-focus
  Scenario: Auto-focus next input when entering verification code
    When I type "1" in the first verification input
    Then the verification code input 1 should be focused

  @button-state
  Scenario: Disable continue button until all 6 digits entered
    Then the continue button should be disabled
    When I enter 5 digits of the verification code
    Then the continue button should be disabled
    When I enter the verification code "123456"
    Then the continue button should be enabled
