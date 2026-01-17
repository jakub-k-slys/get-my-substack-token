@error-handling
Feature: Error Handling
  As a user
  I want to see clear error messages when something goes wrong
  So that I can understand what to do next

  Background:
    Given I am on the sign in page

  @email-error
  Scenario: Email login API error
    Given the email login is configured to fail
    When I enter the email "test@example.com"
    And I click the continue button
    Then the "error-message" element should be visible
    And the page title should be "Sign in to Substack"

  @otp-error
  Scenario: OTP verification error
    Given the OTP verification is configured to fail
    When I enter the email "test@example.com"
    And I click the continue button
    Then I should proceed to the verification step
    When I enter the verification code "123456"
    And I click the continue button
    Then the "error-message" element should be visible
    And I should stay on the verification step

  @mfa-error
  Scenario: MFA verification error
    Given the MFA verification is configured to fail
    When I enter the email "test@example.com"
    And I click the continue button
    Then I should proceed to the verification step
    When I enter the verification code "123456"
    And I click the continue button
    Then I should be on the two-factor authentication step
    When I enter the 2FA code "123456"
    And I click the confirm button
    Then the "error-message" element should be visible
    And I should stay on the two-factor authentication step
