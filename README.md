# Stellar Disbursement Platform Frontend

## Introduction

The Stellar Disbursement Platform (SDP) enables organizations to disburse bulk payments to recipients using Stellar.

This repo contains the SDP dashboard UI, which is to be used with the [Stellar Disbursement Platform Backend](https://github.com/stellar/stellar-disbursement-platform-backend). For more information on how to get started, see the Stellar [dev docs](https://developers.stellar.org/docs/category/use-the-stellar-disbursement-platform) and [API reference](https://developers.stellar.org/api/stellar-disbursement-platform).

The SDP's comprehensive dashboard includes the following pages:
* Dashboard Home (Overview): Summary of recent disbursement activities and key metrics, including successful payment rate, total successful/failed/remaining payments, total disbursed, individuals, and wallets.
* Disbursements Page (Management): Create, draft, search, filter, and export disbursements.  Detailed disbursement page includes names, total payments, successes, failures, remaining, creation date, total amount, and disbursed amount.
* Receivers Page (Overview): List of individuals set to receive payments, with wallet information and payment history. May also search, filter, and export receiver data in CSV.
* Payments Page (Overview): Summary of all payments, including search by payment ID, filters, and export options. Payment detail includes Payment ID, wallet address, disbursement name, completion time, amount, and status information.
* Wallets Page (Management): View Distribution Account information including public key, balance, adding funds, and more, and manage which assets you want to use on the Stellar network.
* Analytics Page (Overview): Provides insights into financial transactions, including successful payment rate, total successful/failed/remaining payments, total disbursed, average amount, total amount per asset, and individuals and wallets involved.

Feedback and contributions are welcome!

### Config

Make sure to set the following for initial local testing:

```javascript
window._env_ = {
  API_URL: "https://localhost:8000",
  STELLAR_EXPERT_URL: "https://stellar.expert/explorer/testnet",
  HORIZON_URL: "https://horizon-testnet.stellar.org",
  RECAPTCHA_SITE_KEY: "6Lego1wmAAAAAJNwh6RoOrsHuWnsciCTIL3NN-bn",
}; 
```
