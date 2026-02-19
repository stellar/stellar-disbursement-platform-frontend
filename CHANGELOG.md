# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## Unreleased

- Wallet Providers
  - add a new wallet page [#458](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/458)
  - update wallet [#468](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/468)
  - delete wallet [#474](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/474)
- Implement reCAPTCHA for admin dashboard [470](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/470)

## [6.1.0](https://github.com/stellar/stellar-disbursement-platform-frontend/releases/tag/6.1.0) ([diff](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/6.0.1...6.1.0))

### Changed

- Improve Wallet History Component functionality:
   - Filter spam/dust transactions (<0.001), show last 10 payments, add Stellar Expert link, add info tooltip, and increase asset amount decimal precision from 2 to 3 digits. [#414](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/414)
   - Add support for contract accounts operations in the Wallet History component. [#419](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/419)
- Hide 'Customize Invite' section for KWA disbursements. [#432](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/432)
- Add embedded wallet provider [#449](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/449)

### Security and Dependencies

- Upgrade React to 19.2.3 and @stellar/design-system to 3.2.7 to address CVE-2025-55184 denial of service and source code exposure vulnerability in React Server Components [#407](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/407)
- Bump lodash from 4.17.21 to 4.17.23 [#451](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/451)
- Bump qs from 6.13.0 to 6.14.1 [#427](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/427)
- Bump the minor-and-patch group across 1 directory with 9 updates [#412](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/412)
- Bump @types/node from 24.10.2 to 25.0.2 in the major group [#410](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/410)
- Bump docker/login-action from 3.6.0 to 3.7.0 in the all-actions group [#459](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/459)

## [6.0.1](https://github.com/stellar/stellar-disbursement-platform-frontend/releases/tag/6.0.1) ([diff](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/6.0.0...6.0.1))

### Changed
- Update links to the dev docs and api docs. [#399](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/399)

### Fixed
- display MFA and reCAPTCHA toggle status in organization settings. [#403](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/403)

### Security and Dependencies
- Bump the major group with 2 updates (@types/uuid, eslint-plugin-react-hooks). [#397](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/397)
- Bump the minor-and-patch group across 1 directory with 11 updates. [#398](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/398)

## [6.0.0](https://github.com/stellar/stellar-disbursement-platform-frontend/releases/tag/6.0.0) ([diff](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/5.0.0...6.0.0))

### Added
- Add Wallet History for Stellar Distribution Accounts. [#385](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/385)

### Fixed
- Fix message when adding unknown trustline [#388](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/388)

### Security and Dependencies
- Upgrade React to 19.2.1 to address CVE-2025-66478 and CVE-2025-55182 [#390](https://github.com/stellar/stellar-disbursement-platform-backend/pull/390)
- Bump the minor-and-patch group across 1 directory with 30 updates. [#386](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/386)
- Bump the all-actions group across 1 directory with 4 updates. [#383](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/383)
- Bump js-yaml from 4.1.0 to 4.1.1. [#381](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/381)
- Bump vite from 7.1.5 to 7.1.11 in the npm_and_yarn group across 1 directory. [#369](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/369)


## [5.0.0](https://github.com/stellar/stellar-disbursement-platform-frontend/releases/tag/5.0.0) ([diff](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/4.1.0...5.0.0))

### Added
- Add MFA and reCAPTCHA organization settings toggles. [#345](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/345)

### Changed
- Update description for stellar distribution account. [#366](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/366)
- Update description for creating disbursements. [#368](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/368)
- Support contract addresses in receiver create. [#373](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/373)
- Disable balance and history fetching for contract accounts. [#372](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/372)

### Fixed
- Align testnet EURC issuer with backend configuration. [#356](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/356)

## [4.1.0](https://github.com/stellar/stellar-disbursement-platform-frontend/releases/tag/4.1.0) ([diff](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/4.0.1...4.1.0))

### Added
- Add initiator and approver roles with separated disbursement operations to enforce role-based workflow controls.
  [#346](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/346)
- Allow adding trustline from preset assets. [#350](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/350)
- Create Direct Payment Modal: Display registered wallets and SEP24 compatible wallets. [#343](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/343)

### Changed
- Improve CSV parsing robustness in `csvTotalAmount` helper by using PapaParse library to handle edge cases. [#344](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/344)
- Create Direct Payment Modal: Allow alphanumeric pin in Verifications. [#347](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/347)

### Fixed
- Re-enabled the retry invitation message button. [#339](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/339)

## [4.0.1](https://github.com/stellar/stellar-disbursement-platform-frontend/releases/tag/4.0.0) ([diff](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/4.0.0...4.0.1))

### Changed

- Using immutable data handling in React Query. [#331](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/331)
- Re-Enabeled the retry invitation message button. [#339](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/339)

### Fixed

- Validate length of message template and organization name. [#330](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/330)

## [4.0.0](https://github.com/stellar/stellar-disbursement-platform-frontend/releases/tag/4.0.0) ([diff](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/3.7.0...4.0.0))

> [!WARNING]
> This version is only compatible with the [stellar/stellar-disbursement-platform-backend] version `4.0.0`.

### Added

- API Keys management functionality with create, update, delete, and detailed view capabilities.
  [#271](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/271),
  [#272](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/272),
  [#273](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/273),
  [#274](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/274),
  [#276](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/276),
  [#303](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/303)
- Direct payment functionality allowing one-off payments to receivers.
  [#278](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/278),
  [#270](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/270),
  [#301](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/301),
  [#307](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/307)
- Bridge integration for liquidity sourcing with virtual account management. [#288](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/288)
- Receiver creation modal for adding new receivers directly from the UI.
  [#308](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/308),
  [#317](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/317)
- Ability to unregister a receiver wallet. [#266](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/266)

### Changed

- Migrated build system from Webpack to Vite for improved developer experience and faster builds. [#304](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/304)
- Upgraded to Stellar Design System v3 for modern UI components and improved accessibility.
  [#295](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/295),
  [#318](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/318)
- Updated to React v19 and Node.js v22 with other dependency upgrades.
  [#309](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/309),
  [#284](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/284)
- Enhanced receiver search functionality to trigger with 3+ characters and improved UX. [#301](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/301)
- Changed ESLint configuration to use local version instead of system version. [#321](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/321)
- Updated Docker base image from nginx 1.27 to 1.29. [#279](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/279)

### Fixed

- Payment Details page sender data display to be conditional based on API availability. [#316](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/316)


## [3.7.0](https://github.com/stellar/stellar-disbursement-platform-frontend/releases/tag/3.7.0) ([diff](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/3.6.0...3.7.0))

> [!WARNING]
> This version is only compatible with the [stellar/stellar-disbursement-platform-backend] version `3.7.0`.

### Fixed

- Fix receiver's XLM balance [#258](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/258)
- Fix the behavior of a toggle that enables automatic payments' cancellation. [#259](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/259)

### Security and Dependencies
- Bump http-proxy-middleware in the npm_and_yarn group. [#261](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/261)

## [3.6.0](https://github.com/stellar/stellar-disbursement-platform-frontend/releases/tag/3.6.0) ([diff](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/3.5.0...3.6.0))

> [!WARNING]
> This version is only compatible with the [stellar/stellar-disbursement-platform-backend] version `3.6.0`.

### Added

- Feature to toggle memo tracking. [#237](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/237)
- Add the `Wallet address memo` field to the Receiver Details page. [#248](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/248)
- Add PR template. [#249](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/249)

### Changed

- Improve UX on the forgotPassword->resetPassword flow by parsing the reset token in the URL, which reduces human intervention. [#239](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/239)
- Improve UX on the resetPassword->signIn flow by automatically redirecting the user to the signIn page after the reset password request succeeds, and showing a success notification in the signIn page. [#242](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/242)
- Prettify the disbursement status text in the Disbursements table, similar to the payment status in the payment table. [#240](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/240)
- Change the `Confirm Disbursement` operation to be atomic. This change ensures that the disbursement creation and instruction processing is done in a single operation. [#241](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/241)

### Fixed

- Rename variable `is_tenant_memo_enabled` to `is_memo_tracing_enabled` [#238](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/238)
- Fix .env example in README.md. [#251](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/251)

### Security and Dependencies

- Bump dependencies [#250](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/250):
  - `@babel/helpers` from 7.21.0 to 7.26.10
  - `@babel/runtime` from 7.22.6 to 7.26.10
  - `elliptic` from 6.6.0 to 6.6.1
- Bump GitHub Actions. [#252](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/252)

## [3.5.0](https://github.com/stellar/stellar-disbursement-platform-frontend/releases/tag/3.5.0) ([diff](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/3.4.0...3.5.0))

> [!WARNING]
> This version is only compatible with the [stellar/stellar-disbursement-platform-backend] version `3.5.0`.

### Added

- Added option to enable short linking in the Settings page.
  [#230](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/230)

### Changes

- Make wide tables responsive and wrap disbursement name.
  [#232](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/232)
- Automate the Release Process 🤖.
  [#231](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/231)

## [3.4.0](https://github.com/stellar/stellar-disbursement-platform-frontend/releases/tag/3.4.0) ([diff](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/3.3.0...3.4.0))

> [!WARNING]
> This version is only compatible with the [stellar/stellar-disbursement-platform-backend] version `3.4.0`.

### Added

- Support for the `q` query param in the Payments page.
  [#225](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/225)

### Security and Dependencies

- Bump webpack-dev.
  [#226](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/226)
- Bump docker/build-push-action.
  [#215](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/215)

## [3.3.0](https://github.com/stellar/stellar-disbursement-platform-frontend/releases/tag/3.3.0) ([diff](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/3.2.0...3.3.0))

> [!WARNING] This version is only compatible with the
> [stellar/stellar-disbursement-platform-backend] version `3.3.0`.

### Added

- Feature that scrolls the screen to top when a notification is displayed.
  [#187](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/187)
- Feature where the tenant name is fetched from the local storage first and then
  it's only inferred from the domain if `DISABLE_TENANT_PREFIL_FROM_DOMAIN` is
  NOT set to true.
  [#221](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/221)

## [3.2.0](https://github.com/stellar/stellar-disbursement-platform-frontend/releases/tag/3.2.0) ([diff](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/3.1.0...3.2.0))

> [!WARNING] This version is only compatible with the
> [stellar/stellar-disbursement-platform-backend] version `3.2.0`.

### Changed

- Enabled patching of already confirmed verification fields for receivers,
  addressing scenarios where users might get locked out of a partner’s system.
  [#213](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/213)
- Display the `external_payment_id` field in the Payments tarble. It used to be
  displayed only in the Payment Details page.
  [#214](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/214)

## [3.1.0](https://github.com/stellar/stellar-disbursement-platform-frontend/releases/tag/3.1.0) ([diff](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/3.0.0...3.1.0))

Release of the Stellar Disbursement Platform `v3.1.0`. This release introduces
key updates, including the migration to Circle's Payouts API, aligning with
Circle's latest recommendations. It also enhances platform functionality by
enabling data export through dedicated endpoints, allowing users to export
disbursements, payments, and receivers with filters. Additionally, users now
have the ability to delete disbursements in `DRAFT` or `READY` status,
streamlining data management workflows.

> [!WARNING] This version is only compatible with the
> [stellar/stellar-disbursement-platform-backend] version `3.1.0`.

### Added

- Export functionality, allowing users to export:
  - Disbursements with filters.
    [#202](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/202)
  - Payments and Receivers with filters.
    [#203](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/203)
- Option to delete a disbursement in `DRAFT` or `READY` status.
  [#205](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/205)

### Changed

- Update the Disbursements table by adding the status column.
  [#194](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/194)

### Security and Dependencies

- Bump `react-router-dom` from 6.28.0 to 7.0.1.
  [#197](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/197)
- Bump the minor-and-patch.
  [#198](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/198),
  [#200](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/200)
- Bump docker/build-push-action from 6.9.0 to 6.11.0 in the all-actions group.
  [#195](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/195),
  [#207](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/207)

## [3.0.0](https://github.com/stellar/stellar-disbursement-platform-frontend/releases/tag/3.0.0) ([diff](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/2.1.0...3.0.0))

Release of the Stellar Disbursement Platform `v3.0.0`. In this release, receiver
registration does not need to be done exclusively through SMS as it now supports
new types. The options are `PHONE_NUMBER`, `EMAIL`, `EMAIL_AND_WALLET_ADDRESS`,
and `PHONE_NUMBER_AND_WALLET_ADDRESS`. If a receiver is registered with a wallet
address, they can receive the payment right away without having to go through
the SEP-24 registration flow.

> [!WARNING]
> This version is only compatible with the [stellar/stellar-disbursement-platform-backend] version `3.0.0`.

### Added

- Display the user email in the "Team Members" section
  [#131](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/131)
- Ability to register receivers using email addresses:
  - Support receiver contact info for both phone number and email
    [#150](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/150)
  - Add email column to the CSV template
    [#141](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/141)
  - Rename fields for receiver invitation templates and intervals to be channel
    agnostic
    [#147](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/147)
  - Update organization SMS retry configuration to reflect both email and SMS
    [#148](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/148)
- Ability to register receivers with a Stellar wallet address directly by
  providing contact info and a wallet address. Options include
  `PHONE_NUMBER_AND_WALLET_ADDRESS` and `EMAIL_AND_WALLET_ADDRESS`:
  - Support multiple registration types for receivers: `PHONE_NUMBER`, `EMAIL`,
    `PHONE_NUMBER_AND_WALLET_ADDRESS`, `EMAIL_AND_WALLET_ADDRESS`
    [#176](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/176)
  - Make receiver verifications optional
    [#178](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/178)
  - Update `GET /wallets` with the `?user_managed={boolean}` query param
    [#179](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/179)
  - Update the "Download template CSV" button to return a template based on the
    receiver registration and verification types selected during disbursement
    creation
    [#185](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/185)
  - Polish flow when creating a disbursement targeting wallet addresses
    [#186](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/186)

### Changed

- Dropdowns in disbursement creation now follow inter-dependency logic based on
  registration types
  [#177](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/177)

### Fixed

- Remove draft payments from remaining payments count when calculating the
  percentage of successful payments
  [#132](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/132)
- Prevent selection of an asset without a trustline or balance
  [#134](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/134)
- Disable "Org Name" input when in single-tenant mode
  [#135](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/135)
- Correct calculation for success payments percentage on the home page
  [#167](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/167)
- Calculate balance after CSV re-upload on the draft disbursement screen
  [#190](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/190)

### Security and Dependencies

- Bump the all-docker group
  [#122](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/122)
- Bump the all-actions group
  [#123](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/123)
- Update `docker/build-push-action` from `6.5.0` to `6.7.0` in the all-actions
  group
  [#136](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/136)
- Upgrade `elliptic` from `6.5.4` to `6.5.7` in the npm_and_yarn group
  [#142](https://github.com/stellar/stellar-disbursement-platform-frontend/pull/142)

## [2.1.0](https://github.com/stellar/stellar-disbursement-platform-frontend/releases/tag/2.1.0) ([diff](https://github.com/stellar/stellar-disbursement-platform-frontend/compare/2.0.0...2.1.0))

Release of the Stellar Disbursement Platform v2.1.0. This release introduces the
option to set different distribution account signers per tenant, as well as
Circle support, so the tenant can choose to run their payments through the
Circle API rather than directly on the Stellar network.

> [!WARNING]
> This version is only compatible with the
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

> [!WARNING]
> This version is only compatible with the
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
