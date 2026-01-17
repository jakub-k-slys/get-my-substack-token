@visual-elements
Feature: Visual Elements
  As a user
  I want to see all visual elements properly displayed
  So that I can navigate the authentication flow

  Background:
    Given I am on the sign in page

  @card
  Scenario: Auth card is visible
    Then the "auth-card" element should be visible

  @container
  Scenario: Main container is visible
    Then the "main-container" element should be visible

  @input
  Scenario: Email input is visible
    Then the "email-input" element should be visible

  @button
  Scenario: Continue button is visible
    Then the "continue-button" element should be visible
