# Stellar Disbursement Platform Frontend

## Introduction

The Stellar Disbursement Platform (SDP) enables organizations to disburse bulk
payments to recipients using Stellar.

This repo contains the SDP dashboard UI, which is to be used with the
[Stellar Disbursement Platform Backend](https://github.com/stellar/stellar-disbursement-platform-backend).
For more information on how to get started, see the Stellar
[dev docs](https://developers.stellar.org/docs/category/use-the-stellar-disbursement-platform)
and
[API reference](https://developers.stellar.org/api/stellar-disbursement-platform).

The SDP's comprehensive dashboard includes the following pages:

- Dashboard Home (Overview): Summary of recent disbursement activities and key
  metrics, including successful payment rate, total successful/failed/remaining
  payments, total disbursed, individuals, and wallets.
- Disbursements Page (Management): Create, draft, search, filter, and export
  disbursements. Detailed disbursement page includes names, total payments,
  successes, failures, remaining, creation date, total amount, and disbursed
  amount.
- Receivers Page (Overview): List of individuals set to receive payments, with
  wallet information and payment history. May also search, filter, and export
  receiver data in CSV.
- Payments Page (Overview): Summary of all payments, including search by payment
  ID, filters, and export options. Payment details include Payment ID, wallet
  address, disbursement name, completion time, amount, and status information.
- Wallets Page (Management): View Distribution Account information including
  public key, balance, adding funds, and more, and manage which assets you want
  to use on the Stellar network.
- Analytics Page (Overview): Provides insights into financial transactions,
  including successful payment rate, total successful/failed/remaining payments,
  total disbursed, average amount, total amount per asset, and individuals and
  wallets involved.

Feedback and contributions are welcome!

## Environment Variables

Environment variables can be set either on a global `window._env_` object or as
`process.env` variables. All environment variables used in this repo are in
`src/constants/envVariables.ts` file, including types.

### `window`

The default location of the `window._env_` object is
`public/settings/env-config.js` (not included in the repo). The path can be
updated in `src/constants/envVariables.ts` variable `WINDOW_ENV_PATH`.

Example settings for local testing:

```javascript
window._env_ = {
  API_URL: "https://localhost:8000",
  STELLAR_EXPERT_URL: "https://stellar.expert/explorer/testnet",
  HORIZON_URL: "https://horizon-testnet.stellar.org",
  RECAPTCHA_SITE_KEY: "6Lego1wmAAAAAJNwh6RoOrsHuWnsciCTIL3NN-bn",
  SINGLE_TENANT_MODE: false,
};
```

### `process`

The `.env` file should be placed in the root directory of the repo. All
variables should be prefixed with `REACT_APP_`.

Set the value to true to avoid fetching the file if the Window ENV is not used.

<!-- prettier-ignore -->
> [!NOTE]
> Set `REACT_APP_DISABLE_WINDOW_ENV=true` to avoid fetching the
> `public/settings/env-config.js` file if the `window._env_` is not used.

<!-- prettier-ignore -->
> [!NOTE]
> Set `REACT_APP_DISABLE_TENANT_PREFIL_FROM_DOMAIN=true` to skip prefilling the hostname from the domain.

For example:

```
REACT_APP_DISABLE_WINDOW_ENV=true
REACT_APP_DISABLE_TENANT_PREFIL_FROM_DOMAIN=false
REACT_APP_API_URL=https://localhost:8000
REACT_APP_STELLAR_EXPERT_URL=https://stellar.expert/explorer/testnet
REACT_APP_HORIZON_URL=https://horizon-testnet.stellar.org
REACT_APP_RECAPTCHA_SITE_KEY=6Lego1wmAAAAAJNwh6RoOrsHuWnsciCTIL3NN-bn
```

## Favicon

[Favicon](https://developer.mozilla.org/en-US/docs/Glossary/Favicon) image files
are located in `/public` directory. The files are:

- `apple-touch-icon.png` - mostly used for shortcuts
- `favicon.ico` - for legacy browsers and devices
- `icon-192.png` and `icon-512.png` - fallback if SVG is not supported
- `icon.svg` - modern browser support is very good (can be adjusted to match
  operating system theme)

Having this set of favicons should cover all devices and browsers. They are set
in `/src/index.html` and `/public/manifest.json` files.

<figure>
  <img
  src="public/icon-192.png"
  alt="Stellar logo favicon">
  <figcaption>Default favicon</figcaption>
</figure>
