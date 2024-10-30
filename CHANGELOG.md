# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## Unreleased

> Place unreleased changes here.

## [3.0.0-rc.2](https://github.com/stellar/stellar-disbursement-platform-frontend/releases/tag/3.0.0-rc.2) ([diff](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/3.0.0-rc.1...3.0.0-rc.2))

Release of the Stellar Disbursement Platform v3.0.0-rc.2. This release includes
one fix to the dashboard.

### Fix

- Fix the calculation for the success payments percentage in the home page.
  [#167](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/167)

## [3.0.0-rc.1](https://github.com/stellar/stellar-disbursement-platform-frontend/releases/tag/3.0.0-rc.1) ([diff](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/2.1.0...3.0.0-rc.1))

Release of the Stellar Disbursement Platform v3.0.0-rc.1. This release
introduces the option to register receivers using email addresses, in addition
to phone numbers.

> [!Warning] This version is only compatible with the
> [stellar/stellar-disbursement-platform-backend] version `3.0.0-rc.1`.

### Added

- Display the user email on the "Team Members" section
  [#131](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/131)
- Add the ability to register receivers using email addresses
  - Receiver contact info: support phone number and email
    [#150](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/150)
  - Add email column to the CSV template
    [#141](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/141)
  - Rename fields for receiver invitation template and interval to be channel
    agnostic
    [#147](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/147)
  - Update Organization SMS Retry configuration to reflect both Email and SMS
    [#148](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/148)

### Changed

- Remove draft payments from remaining payments count when calculating
  percentage of successful payments
  [#132](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/132)
- Do not allow selection of an asset that does not have a trustline or balance
  [#134](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/134)
- Disable "Org Name" input when in single tenant mode
  [#135](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/135)

### Security and Dependencies

- bump the all-docker group
  [#122](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/122)
- bump the all-actions group
  [#123](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/123)
- bump docker/build-push-action from 6.5.0 to 6.7.0 in the all-actions group
  [#136](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/136)
- bump elliptic from 6.5.4 to 6.5.7 in the npm_and_yarn group
  [#142](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/142)

## [2.1.0](https://github.com/stellar/stellar-disbursement-platform-frontend/releases/tag/2.1.0) ([diff](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/2.0.0...2.1.0))

Release of the Stellar Disbursement Platform v2.1.0. This release introduces the
option to set different distribution account signers per tenant, as well as
Circle support, so the tenant can choose to run their payments through the
Circle API rather than directly on the Stellar network.

> [!Warning] This version is only compatible with the
> [stellar/stellar-disbursement-platform-backend] version `2.1.0`.

### Added

- Implement support for Circle distribution accounts
  [#114](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/114),
  [#119](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/119).
  - When the account is of type Circle and it's status is not Active, a banner
    is displayed to direct the user through the Circle setup.
  - A new flow was added to allow the user to set up the Circle account.
  - When the account is of type Circle, balances are fetched from the SDP
    backend rather than the Stellar network.
  - The payment details page now shows the Circle transaction ID, when
    available.
- Support the new verification type `YEAR_MONTH`
  [#121](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/121)
- Added dependabot extra features
  [#118](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/118)

### Fix

- Update some fields usage to optional, since they may not be present on the
  payload comming from the backend
  [#120](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/120)

### Security

- Update the `ws` and `braces` dependencies to fix security vulnerabilities.
  [#117](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/117)

## [2.0.0](https://github.com/stellar/stellar-disbursement-platform-frontend/releases/tag/2.0.0)

### Added

Release of the Stellar Disbursement Platform v2.0.0. This release introduces
multi-tenancy support, allowing multiple tenants (organizations) to use the
platform simultaneously.

Each organization has its own set of users, receivers, disbursements, etc.

> [!Warning] This version is only compatible with the
> [stellar/stellar-disbursement-platform-backend] version 2.x.x. In order to
> migrate from 1.x.x to 2.x.x, please consult the
> [SDP Migration Guide](https://developers.stellar.org/network/stellar-disbursement-platform/admin-guide/single-tenant-to-multi-tenant-migration).

### Added

- Make the dashboard tenant aware
  [#44](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/44)
- Add Organization (Tenant Name) selection text box to Login, Reset Password and
  Forgot Password pages
  [#50](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/50)
- Derive Organization (Tenant Name) from the hostname prefix when possible
  [#56](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/56)
- Add Future Balance label in the Disbursement Details page.
  [#76](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/76)
- Ability for users to add/update verification info for receivers.
  [#78](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/78)

## [1.1.2](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/1.1.1...1.1.2)

Attention, this version is compatible with the backend version
[1.1.6](https://github.com/stellar/stellar-disbursement-platform-frontend/releases/tag/1.1.6).

### Added

- Add the "Future Balance" label in the disbursement detail component to display
  what will be balance for the asset on the distribution account after the
  disbursement is completed.
  [#76](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/76)
- Add option to update a receiver's verification info from the receiver's detail
  page.
  [#78](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/78)

### Changed

- Update the CSV template by adding examples with and without the paymentID
  (optional) column.
  [#77](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/77)
- Display the entire disbursement account address for the tenant when that
  disbursement account does not exist in the network, making it easier to
  identify the account that needs to be funded.
  [#80](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/80)

## [1.1.1](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/1.1.0...1.1.1)

### Fixed

- Retry payment button was not showing up on failed payments
  [#72](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/72).

## [1.1.0](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/1.0.1...1.1.0)

### Added

- Add dropdown for choosing verification type when creating new disbursements
  [#53](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/53)
- Display external payment ID on payments details page
  [#59](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/59)
- Add a cancel button to payments details page
  [#60](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/60)
- Add env variable injection to dashboard
  [#62](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/62)
- Add SMS preview & editing before sending a new disbursement
  [#66](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/66)
- Display `Created By` and `Started By` on disbursement details page
  [#68](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/68)

### Changed

- State Refactors
  - receiver payments, wallet balance, wallet history
    [#34](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/34)
  - users
    [#36](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/36)
  - wallet providers
    [#37](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/37)
  - countries
    [#42](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/42)
- Automatic cancellation of payments in `READY` status after a certain time
  period
  [#38](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/38)

### Chores

- Optimize refresh token for dispatch actions
  [#39](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/39)
- Analytics cards: adjust layout
  [#47](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/47)
- Updated favicons and README
  [#64](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/64)
- Business user role should receive permission to view details for individual
  payments, details, and receivers
  [#63](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/63)
- Standardize errors with extras
  [#61](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/61)
- Update SDS package
  [#58](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/58)
- Show error details upon sign-in
  [#57](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/57)

### Fixed

- Fix input entry for Payments cancellation and SMS retry
  [#43](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/43)
- Fix table overflow crop
  [#55](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/55)

## [1.0.0](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/1.0.0-rc2...1.0.0)

### Added

- Add a new screen to manage Wallet Providers.
  [#14](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/14)
- Add re-send SMS invitation functionality.
  [#18](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/18)
- Customize receiver wallet invite SMS message.
  [#17](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/17)
- Display asset issuer for Trustlines in the Distribution account screen
  [#20](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/20)
- Settings: configure SMS retry interval
  [#28](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/28)

### Changed

- Change payment status history sort order to descending order.
  [#15](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/15)
- Filter assets based on wallet selection in New Disbursement screen.
  [#24](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/24)
- Only show enabled wallets in the New Disbursement screen.
  [#29](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/29)

### Security

- Add warning message about Distribution account funds
  [#11](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/11)

## [1.0.0.rc2](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/1.0.0-rc1...1.0.0-rc2)

### Added

- Support for a 2-step approval for the disbursement, where one user creates the
  disbursement and another approves it.
  [#1](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/1),
  [#3](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/3)
- Support to edit receivers.
  [#5](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/5)
- Support for changing the password without resorting to the "fogot password"
  flow.
  [#6](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/6)

### Changed

- Readme instructions.
  [#2](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/2)

## [1.0.0.rc1](https://github.com/stellar/stellar-disbursement-platform-frontend/releases/tag/1.0.0-rc1)

### Added

First Release Candidate of the Stellar Disbursement Platform, a tool used to
make bulk payments to a list of recipients based on their phone number and a
confirmation date. This repository is frontend-only, is a client to the backend
version available at [stellar/stellar-disbursement-platform-backend]. Their
version numbers are meant to be kept in sync.

The basic process of this product starts with an organization supplying a CSV
file which includes the recipients' phone number, transfer amount, and essential
customer validation data such as the date of birth.

The platform subsequently sends an SMS to the recipient, which includes a deep
link to the wallet. This link permits recipients with compatible wallets to
register their wallet on the SDP. During this step, they are required to verify
their phone number and additional customer data through the SEP-24 interactive
deposit flow, where this data is shared directly with the backend through a
webpage inside the wallet, but the wallet itself does not have access to this
data.

Upon successful verification, the SDP backend will transfer the funds directly
to the recipient's wallet. When the recipient's wallet has been successfully
associated with their phone number in the SDP, all subsequent payments will
occur automatically.

[stellar/stellar-disbursement-platform-backend]:
  https://github.com/stellar/stellar-disbursement-platform-backend
