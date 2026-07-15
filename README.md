# SAPCONE

This repository contains the frontend application workspace for the Stellar Disbursement Platform (SDP), customized for Sustainable Approaches for Community Empowerment (SAPCONE).

---

## 1. Executive Summary and Core Concept

SAPCONE operates cash transfer and humanitarian programs across Kenya, Uganda, Ethiopia, and South Sudan. In Kenya, mobile money and bank transfers move funds reliably. However, in cross-border corridors or when delivering to phone-less beneficiaries, the system falls back to cash handovers or manual paper sign-offs.

This frontend implements a 3-Phase DisburseFlow Studio dashboard designed to:
1. Validate and edit beneficiary payout details via CSV upload or manual entry.
2. Verify beneficiary identity and KYC details (Date of Birth).
3. Execute and trace transaction batches submitted to the Stellar Network.

All core SDP backend functionalities are handled by the Go API services, allowing this frontend to serve as a focused, highly interactive workflow manager.

---

## 2. Local Development and Setup

### Prerequisites
* Node.js: Version >= 22.x
* NPM: Package manager (installed automatically with Node)

### Setup Instructions

```bash
# 1. Install dependencies
npm install

# 2. Start the Vite local development server
npm run start

# 3. Generate a production build
npm run build
```

The application will be available at http://localhost:3001 (or the next available port).

---

## 3. Environment Variables

Create a `.env` file at the project root for local settings.

| Variable | Description | Default / Example |
|---|---|---|
| `REACT_APP_DISABLE_WINDOW_ENV` | Skip fetching dynamic environment files | `true` |
| `REACT_APP_API_URL` | Base URL for the Go SDP backend API | `http://localhost:8080` |
| `REACT_APP_HORIZON_URL` | Stellar Horizon Testnet explorer endpoint | `https://horizon-testnet.stellar.org` |
| `REACT_APP_STELLAR_EXPERT_URL` | Stellar Expert network explorer | `https://testnet.stellar.expert` |
| `REACT_APP_SINGLE_TENANT_MODE` | Single organization deployment mode | `true` |

---

## 4. Operational Workflow: The 3 Payout Phases

### Phase 1: Populating the CSV
* **Data Sources**: Allows loading sample batch data from the Go backend, manually inserting custom beneficiary rows, or uploading local CSV format sheets.
* **CSV Schema**: Requires columns: `phone`, `id`, `amount`, `verification`, and `paymentID`.
* **Validation checks**: Automatically detects invalid phone formats, negative amounts, empty values, or duplicate Beneficiary/Payment IDs.
* **Asset Toggle**: Switch the payout token between `USDC` (Circle) and `XLM` (Native).

### Phase 2: Approval and Verification
* View and filter beneficiaries by their IDs, phone numbers, or paymentID.
* Queries backend KYC verification registries to match receiver date-of-birth data.
* Toggles approval status per beneficiary or approves all loaded users.

### Phase 3: Disbursement Execution
* Reviews ledger transaction costs, distribution account status, and trustlines.
* Traces real-time container log outputs during transaction batching and signatures.
* Tracks final on-chain confirmations and links transaction hashes to the block explorer.

---

## 5. Backend Integration Guide

For details on connecting this frontend workspace to the Go-based Stellar Disbursement Platform API, Horizon node, and Transaction Submission Service (TSS), please refer to the separate [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) documentation file.
