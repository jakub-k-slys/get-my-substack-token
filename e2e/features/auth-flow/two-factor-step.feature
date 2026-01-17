@two-factor-step
Feature: Two-Factor Authentication Step
  As a user with 2FA enabled
  I want to enter my 2FA code
  So that I can securely authenticate

  Background:
    Given I am on the sign in page
    When I enter the email "test@example.com"
    And I click the continue button
    Then I should proceed to the verification step
    When I enter the verification code "123456"
    And I click the continue button
    Then I should be on the two-factor authentication step

  @happy-path
  Scenario: Complete 2FA verification
    When I enter the 2FA code "123456"
    And I click the confirm button
    Then I should be on the token display step

  @skip
  Scenario: Skip 2FA step
    When I click the skip 2FA button
    Then I should be on the token display step
