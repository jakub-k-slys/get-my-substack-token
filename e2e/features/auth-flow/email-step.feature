@email-step
Feature: Email Step
  As a user
  I want to enter my email to start the sign-in process
  So that I can authenticate with Substack

  Background:
    Given I am on the sign in page

  @initial-state
  Scenario: Display email step initially
    Then the page title should be "Sign in to Substack"
    And the "email-input" element should be visible
    And the "continue-button" element should be visible

  @initial-state
  Scenario: Display header icon
    Then the "header-icon" element should be visible

  @validation
  Scenario: Show validation error for empty email
    When I submit the form without entering an email
    Then I should see the email validation error "Email is required"

  @validation
  Scenario: Prevent submission with invalid email format
    When I enter the email "not-an-email"
    And I click the continue button
    Then the continue button should show "Continue"

  @happy-path
  Scenario: Accept valid email and proceed
    When I enter the email "test@example.com"
    And I click the continue button
    Then I should proceed to the verification step

  @input-attributes
  Scenario: Email input has correct type
    Then the email input should have type "email"

  @form-interaction
  Scenario: Submit form with Enter key
    When I enter the email "test@example.com"
    And I press Enter on the email input
    Then I should proceed to the verification step

  @validation
  Scenario: Clear validation error when valid email submitted
    When I submit the form without entering an email
    Then I should see the email validation error "Email is required"
    When I enter the email "test@example.com"
    And I click the continue button
    Then I should proceed to the verification step

  @validation @edge-case
  Scenario: Accept email with subdomain
    When I enter the email "user@mail.example.co.uk"
    And I click the continue button
    Then I should proceed to the verification step

  @validation @edge-case
  Scenario: Accept email with plus addressing
    When I enter the email "user+tag@example.com"
    And I click the continue button
    Then I should proceed to the verification step

  @validation @edge-case
  Scenario: Reject email without proper domain
    When I enter the email "user@invalid"
    And I click the continue button
    Then I should stay on the email step

  @validation @edge-case
  Scenario: Handle very long email
    When I enter the email "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@test.com"
    And I click the continue button
    Then I should see an email validation error
