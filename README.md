# Stellar Disbursement Studio - SAPCONE Frontend

This repository contains the simplified frontend application for the Stellar Disbursement Platform (SDP), customized for Sustainable Approaches for Community Empowerment (SAPCONE) under the GIVE Kenya Stellar Impact Studio (July 2026).

---

## 1. Executive Summary and Core Concept

SAPCONE operates cash transfer and humanitarian programs across Kenya, Uganda, Ethiopia, and South Sudan. In Kenya, mobile money and bank transfers move funds reliably. However, in cross-border corridors or when delivering to phone-less beneficiaries, the system falls back to cash handovers or manual paper sign-offs.

This frontend implements a simplified 3-Phase DisburseFlow Studio dashboard designed to:
1. Validate and edit beneficiary payout details via CSV upload or manual entry.
2. Verify beneficiary identity and KYC details (Date of Birth).
3. Execute and trace transaction batches submitted to the Stellar Network.

All core SDP backend functionalities have been offloaded to the Go API services, allowing this frontend to serve as a focused, highly interactive workflow manager.

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

Create a .env file at the project root for local settings.

| Variable | Description | Default / Example |
|---|---|---|
| `REACT_APP_DISABLE_WINDOW_ENV` | Skip fetching dynamic environment files | `true` |
| `REACT_APP_API_URL` | Base URL for the future Go SDP backend API | `http://localhost:8080` |
| `REACT_APP_HORIZON_URL` | Stellar Horizon Testnet explorer endpoint | `https://horizon-testnet.stellar.org` |
| `REACT_APP_STELLAR_EXPERT_URL` | Stellar Expert network explorer | `https://testnet.stellar.expert` |
| `REACT_APP_SINGLE_TENANT_MODE` | Single organization deployment mode | `true` |

---

## 4. Design and Aesthetics

The application is styled with Tailwind CSS v4, providing:
* High-Contrast Light Mode: Slate background (`bg-slate-50`) with white panels (`bg-white`) and bold dark-slate text (`text-slate-900`).
* Accessibility Compliance: Colors and contrasts exceed WCAG AA 4.5:1 text-to-background contrast ratio requirements.
* Interactive Feedback: Hover states, disabled controls, active press shifts, and focused input outlines are fully configured.

---

## 5. Operational Workflow: The 3 Payout Phases

### Phase 1: Populating the CSV
* Sample Simulation Batch: A button allows you to pre-populate the grid with the exact synthetic records from Section 7.1 of the SAPCONE DisburseFlow documentation:
  * `PAY_01` | Phone: `16042424000` | Ref: `4ba1` | Amount: `520` | DOB: `01/12/1987`
  * `PAY_02` | Phone: `16034568000` | Ref: `3ce2` | Amount: `600` | DOB: `04/06/1967`
  * `PAY_03` | Phone: `16045638000` | Ref: `4dq1` | Amount: `800` | DOB: `09/08/1997`
  * `PAY_04` | Phone: `16022348000` | Ref: `7re8` | Amount: `700` | DOB: `09/08/1990`
* CSV Schema: Requires columns: `phone`, `id`, `amount`, `verification`, and `paymentID`.
* Validation checks: Automatically detects invalid phone formats, negative amounts, empty values, or duplicate Beneficiary/Payment IDs.
* Asset Toggle: Switch the payout token between `USDC` (Circle) and `XLM` (Native).

### Phase 2: Approval and Verification
* View and filter beneficiaries by their IDs, phone numbers, or paymentID.
* Toggles approval manually per beneficiary or approves all loaded users instantly.
* Calculates approved payout counts and total values.

### Phase 3: Disbursement Execution
* Reviews ledger transaction costs, distribution account status, and trustlines.
* Traces logs step-by-step to match the Section 7.3 PDF simulation trace:
  1. Upload and Validation: Data checks.
  2. SMS Invitation (Dry-Run): Logging dry-run SMS codes.
  3. SEP-24 wallet verification: OTP verification and DOB matches.
  4. TSS queue processing: Batch transaction assembly.
  5. Horizon Settlement: Settle ledger payments and return transaction hashes.

---

## 6. Codebase Cleanup Summary

To simplify the codebase, the following unused directories and components were deleted:
* `src/pages/*` (Removed 32 legacy dashboard pages)
* `src/components/*` (Removed 90+ legacy component folders)
* `src/store/*` (Removed legacy Redux state modules)
* `src/hooks/*` (Removed legacy API and web auth hooks)
* `src/api/*` and `src/apiQueries/*` (Removed legacy SDP API connections)
* `src/types/*` and `src/helpers/*` (Cleaned up legacy schema helpers)

The streamlined file structure is:
* `src/App.tsx`: Unified multi-phase wizard controller and main workspace UI.
* `src/index.tsx`: Main React DOM bootstrapping entrypoint.
* `src/styles/studio.css`: Premium Tailwind CSS stylesheet.
* `src/generated/gitInfo.ts`: Autogenerated build metadata.

---

## 7. Future Backend Schema Reference

Once Go backend API endpoints are ready, developers can connect the frontend features by extending the database.

### Postgres Tables Required (sdp_ schema)

#### `sdp_proxies`
```sql
CREATE TABLE sdp_proxies (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name     TEXT NOT NULL,
    phone_number  TEXT NOT NULL,
    national_id   TEXT NOT NULL UNIQUE,
    relationship  TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `sdp_proxy_deliveries`
```sql
CREATE TABLE sdp_proxy_deliveries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proxy_id        UUID NOT NULL REFERENCES sdp_proxies(id),
    receiver_id     TEXT NOT NULL,
    payment_id      TEXT NOT NULL,
    delivery_status TEXT NOT NULL DEFAULT 'PENDING',
    card_reference  TEXT,
    scan_time       TIMESTAMPTZ,
    stellar_tx_hash TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 8. Backend Integration Guide

For details on connecting this frontend workspace to the Go-based Stellar Disbursement Platform API, Horizon node, and Transaction Submission Service (TSS), please refer to the separate [BACKEND_INTEGRATION.md](file:///home/bethwel/stellar-disbursement-platform-frontend/BACKEND_INTEGRATION.md) documentation file.
