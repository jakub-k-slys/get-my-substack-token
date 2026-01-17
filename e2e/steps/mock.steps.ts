import { Given } from "../fixtures"

Given("the email login is configured to fail", async ({ configureMock }) => {
  await configureMock({ emailLoginShouldFail: true })
})

Given("the OTP verification is configured to fail", async ({ configureMock }) => {
  await configureMock({ otpShouldFail: true })
})

Given("the MFA verification is configured to fail", async ({ configureMock }) => {
  await configureMock({ mfaShouldFail: true })
})

Given("MFA is required", async ({ configureMock }) => {
  await configureMock({ mfaRequired: true })
})

Given("MFA is not required", async ({ configureMock }) => {
  await configureMock({ mfaRequired: false })
})
