# SAPCONE Frontend Extensions — Backend Integration Guide

> **Branch:** `develop`  
> **Prepared by:** GIVE Kenya Stellar Impact Studio · Web3Bridge · July 2026  
> **Audience:** Backend engineers connecting the Go SDP to the SAPCONE-specific frontend features

---

## 1. What This Document Is

This repository is a fork of the [Stellar Disbursement Platform frontend](https://github.com/stellar/stellar-disbursement-platform-frontend).  
On top of the standard SDP dashboard, we have added **SAPCONE-specific extensions** to support:

1. **Proxy Agents** — community members who collect cash on behalf of phone-less beneficiaries
2. **Proxy Deliveries** — on-ground delivery confirmation events tied to QR reference cards

These two features are **fully built on the frontend** and are waiting for backend API endpoints to be wired in. This document tells the backend team exactly what endpoints to build, what shape the data must be in, and where in the frontend to flip the switch from mock data to real API calls.

---

## 2. Running the Frontend Locally

### Prerequisites
- Node.js ≥ 18
- Yarn (`npm install -g yarn`)

### Setup

```bash
# 1. Clone the repo
git clone <your-fork-url>
cd stellar-disbursement-platform-frontend

# 2. Copy the env template and fill in your values
cp .env.example .env
# Edit .env — see Section 3 below

# 3. Install dependencies
yarn install

# 4. Start the dev server
yarn start
```

The app will be available at **http://localhost:3000** (or 3001 if 3000 is taken).

### Dev Login (no backend running)
If the backend is not yet running, inject a fake session token via the browser console to bypass auth for UI development:

```javascript
const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
const payload = btoa(JSON.stringify({
  user: { email: "dev@sapcone.org", roles: ["owner"] },
  exp: Math.floor(Date.now() / 1000) + 86400
}));
localStorage.setItem("sdp_session", `${header}.${payload}.fake-signature`);
// Then refresh the page
```

> ⚠️ This only works locally. Real JWTs are issued by the backend on production.

---

## 3. Environment Variables

Create a `.env` file at the project root. **Never commit `.env`** — it is in `.gitignore`.

| Variable | Description | Example |
|---|---|---|
| `REACT_APP_DISABLE_WINDOW_ENV` | Set `true` when running without the Go backend. Skips the `/settings/env-config.js` fetch. | `true` |
| `REACT_APP_API_URL` | Base URL for the SDP backend API | `http://localhost:8080` |
| `REACT_APP_HORIZON_URL` | Stellar Horizon endpoint | `https://horizon-testnet.stellar.org` |
| `REACT_APP_STELLAR_EXPERT_URL` | Stellar Expert explorer URL | `https://testnet.stellar.expert` |
| `REACT_APP_SINGLE_TENANT_MODE` | Set `true` for SAPCONE (single-org deployment) | `true` |
| `REACT_APP_RECAPTCHA_SITE_KEY` | Leave blank to disable reCAPTCHA locally | _(empty)_ |
| `REACT_APP_RPC_ENABLED` | Set `false` unless RPC is needed | `false` |
| `REACT_APP_USE_SSO` | SSO disabled for SAPCONE | `false` |
| `REACT_APP_DISABLE_TENANT_PREFIL_FROM_DOMAIN` | Disable domain-based tenant prefill locally | `false` |

A working `.env` for local development with no backend:

```env
REACT_APP_DISABLE_WINDOW_ENV=true
REACT_APP_API_URL=http://localhost:8080
REACT_APP_HORIZON_URL=https://horizon-testnet.stellar.org
REACT_APP_STELLAR_EXPERT_URL=https://testnet.stellar.expert
REACT_APP_SINGLE_TENANT_MODE=true
REACT_APP_RECAPTCHA_SITE_KEY=
REACT_APP_RPC_ENABLED=false
REACT_APP_USE_SSO=false
REACT_APP_DISABLE_TENANT_PREFIL_FROM_DOMAIN=false
```

---

## 4. New Routes Added

Two new routes have been added to `src/App.tsx` and `src/constants/settings.ts`:

| Route | Component | Description |
|---|---|---|
| `/proxies` | `src/pages/Proxies.tsx` | Lists all registered proxy agents. Has a "Register Proxy" modal form. |
| `/proxy-deliveries` | `src/pages/ProxyDeliveries.tsx` | Lists all proxy delivery confirmation events with status filtering. |

Both routes are behind `PrivateRoute` and are accessible to roles: `owner`, `financial_controller`, `business`, `initiator`, `approver`.

---

## 5. API Endpoints the Backend Must Implement

These are the **only two things the backend team needs to build** to complete the integration.

---

### 5.1 Proxies

#### `GET /proxies`

Returns paginated list of registered proxy agents.

**Query params:**
| Param | Type | Description |
|---|---|---|
| `page` | `number` | Page number (1-indexed) |
| `page_limit` | `number` | Records per page |

**Response shape (JSON):**

```json
{
  "data": [
    {
      "id": "proxy-001",
      "fullName": "John Amoyo",
      "phoneNumber": "+254700112233",
      "nationalId": "29384756",
      "relationship": "Community Leader",
      "assignedCount": 14,
      "createdAt": "2026-06-01T09:00:00Z"
    }
  ],
  "pagination": {
    "pages": 5,
    "total": 92
  }
}
```

**`relationship` allowed values:**
- `"Community Leader"`
- `"Village Elder"`
- `"Field Staff"`
- `"Relative"`
- `"Neighbor"`

---

#### `POST /proxies`

Registers a new proxy agent.

**Request body (JSON):**

```json
{
  "fullName": "John Amoyo",
  "phoneNumber": "+254700112233",
  "nationalId": "29384756",
  "relationship": "Community Leader"
}
```

**Success response — `201 Created`:**

```json
{
  "id": "proxy-006",
  "fullName": "John Amoyo",
  "phoneNumber": "+254700112233",
  "nationalId": "29384756",
  "relationship": "Community Leader",
  "assignedCount": 0,
  "createdAt": "2026-07-15T10:00:00Z"
}
```

**Validation errors — `400 Bad Request`:**

```json
{
  "error": "Validation failed",
  "details": {
    "fullName": "required",
    "nationalId": "must be unique"
  }
}
```

---

### 5.2 Proxy Deliveries

#### `GET /proxy-deliveries`

Returns paginated list of proxy delivery events.

**Query params:**
| Param | Type | Description |
|---|---|---|
| `page` | `number` | Page number (1-indexed) |
| `page_limit` | `number` | Records per page |
| `status` | `string` | Optional filter: `DELIVERED`, `PENDING`, `FAILED`, `DISPUTED` |

**Response shape (JSON):**

```json
{
  "data": [
    {
      "id": "pdel-001",
      "proxyId": "proxy-001",
      "proxyName": "John Amoyo",
      "receiverId": "rcv-100",
      "receiverName": "Akiru Lokai",
      "paymentId": "pay-9001",
      "deliveryStatus": "DELIVERED",
      "cardReference": "SAPC-TRK-0081",
      "scanTime": "2026-07-01T08:42:00Z",
      "createdAt": "2026-07-01T08:42:00Z"
    }
  ],
  "pagination": {
    "pages": 3,
    "total": 48
  }
}
```

**`deliveryStatus` allowed values:**
| Value | Meaning |
|---|---|
| `DELIVERED` | Proxy confirmed handover — card scanned |
| `PENDING` | Delivery assigned but not yet confirmed |
| `FAILED` | Delivery failed (beneficiary unreachable, etc.) |
| `DISPUTED` | Beneficiary disputes receiving the funds |

---

### 5.3 Database Tables Required

These two tables must be created in the SDP's PostgreSQL schema (prefix `sdp_`):

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
    receiver_id     TEXT NOT NULL,   -- references sdp_receivers.id
    payment_id      TEXT NOT NULL,   -- references sdp_payments.id
    delivery_status TEXT NOT NULL DEFAULT 'PENDING',
    card_reference  TEXT,            -- the QR reference card code scanned
    scan_time       TIMESTAMPTZ,
    stellar_tx_hash TEXT,            -- optional: on-chain anchoring memo tx hash
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 6. Where to Flip the Switch (Mock → Real API)

Both hooks currently return **hardcoded mock data**. Once the backend endpoints are live, replace the mock block with the real fetch call.

### `src/apiQueries/useProxies.ts`

```typescript
// BEFORE (mock — delete this block):
return {
  data: [ /* ...mock data... */ ],
  pagination: { pages: 1, total: 5 },
};

// AFTER (real API — uncomment this line):
return await fetchApi(`${API_URL}/proxies/${params}`);
```

### `src/apiQueries/useProxyDeliveries.ts`

```typescript
// BEFORE (mock — delete this block):
return {
  data: [ /* ...mock data... */ ],
  pagination: { pages: 1, total: 6 },
};

// AFTER (real API — uncomment this line):
return await fetchApi(`${API_URL}/proxy-deliveries/${params}`);
```

The `POST /proxies` call in `src/pages/Proxies.tsx` inside `handleSave()` also has a `TODO` comment where the real API call should replace the simulated delay.

---

## 7. TypeScript Types (for reference)

These are already defined in `src/types/index.ts`:

```typescript
export type Proxy = {
  id: string;
  fullName: string;
  phoneNumber: string;
  nationalId: string;
  relationship: string;
  assignedCount: number;
  createdAt: string;
};

export type ProxyDelivery = {
  id: string;
  proxyId: string;
  proxyName: string;
  receiverId: string;
  receiverName: string;
  paymentId: string;
  deliveryStatus: string;   // "DELIVERED" | "PENDING" | "FAILED" | "DISPUTED"
  cardReference: string;
  scanTime: string;
  createdAt: string;
};

export type ApiProxies = {
  data: Proxy[];
  pagination: { pages: number; total: number };
};

export type ApiProxyDeliveries = {
  data: ProxyDelivery[];
  pagination: { pages: number; total: number };
};
```

---

## 8. Summary of All Files Changed / Added

### Modified files (from upstream SDP)
| File | What changed |
|---|---|
| `src/App.tsx` | Added imports and routes for `/proxies` and `/proxy-deliveries` |
| `src/constants/settings.ts` | Added `PROXIES` and `PROXY_DELIVERIES` to the `Routes` enum |
| `src/components/InnerPage/index.tsx` | Added nav links for Proxies and Proxy Deliveries in the sidebar |
| `src/components/ReceiversTable.tsx` | Added QR card reference column and proxy delivery status column |
| `src/constants/envVariables.ts` | Fixed optional chaining on `window._env_` to prevent crash when backend is offline |
| `src/helpers/formatReceiver.ts` | Extended receiver formatting to include proxy-related fields |
| `src/helpers/formatReceivers.ts` | Extended receivers list formatting |
| `src/pages/ReceiverDetails.tsx` | Added proxy delivery status section to the receiver detail view |
| `src/types/index.ts` | Added `Proxy`, `ProxyDelivery`, `ApiProxies`, `ApiProxyDeliveries` types |
| `package.json` | Minor dependency updates |

### New files (SAPCONE extensions)
| File | Description |
|---|---|
| `src/pages/Proxies.tsx` | Proxy agents list page with Register Proxy modal |
| `src/pages/ProxyDeliveries.tsx` | Proxy deliveries list page with search + status filter |
| `src/components/ProxiesTable.tsx` | Table component for proxy agents |
| `src/components/ProxyDeliveriesTable.tsx` | Table component for delivery events with status badges |
| `src/apiQueries/useProxies.ts` | React Query hook for `GET /proxies` (currently mocked) |
| `src/apiQueries/useProxyDeliveries.ts` | React Query hook for `GET /proxy-deliveries` (currently mocked) |

---

## 9. Questions / Contact

For questions about this integration, contact the GIVE Kenya Studio lead or open an issue on this repository.

**Open design decisions that may affect the backend:**
1. **Custody model** — Each phone-less beneficiary may get their own Stellar account (Option A) or use pooled accounts with memo IDs (Option B). The backend proxy delivery table is designed for Option A but Option B would require adding a `stellar_memo` column.
2. **On-chain anchoring** — Delivery confirmations may be anchored to Stellar as memo transactions. The `stellar_tx_hash` column in `sdp_proxy_deliveries` is reserved for this. Implementation is pending the Flow-of-Funds Design Brief decision.
