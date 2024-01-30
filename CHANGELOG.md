# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## Unreleased

> Place unreleased changes here.

## [1.0.2](https://github.com/stellar/stellar-disbursement-platform-backend/compare/1.0.0...1.0.2)

### Added
- Add dropdown for choosing verification type when creating new disbursements [#53](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/53)
- Display external payment ID on payments details page [#59](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/59)
- Add a cancel button to payments details page [#60](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/60)
- Add env variable injection to dashboard [#62](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/62)
- Display `Created By` and `Started By` on disbursement details page [#68](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/68)

### Changed

- State Refactors
  - receiver payments, wallet balance, wallet history [#34](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/34)
  - users [#36](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/36)
  - wallet providers [#37](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/37)
  - countries [#42](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/42)
- Automatic cancellation of payments in `READY` status after a certain time period [#38](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/38)


## [1.0.0](https://github.com/stellar/stellar-disbursement-platform-backend/compare/1.0.0-rc2...1.0.0)

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

## [1.0.0.rc2](https://github.com/stellar/stellar-disbursement-platform-backend/compare/1.0.0-rc1...1.0.0-rc2)

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
