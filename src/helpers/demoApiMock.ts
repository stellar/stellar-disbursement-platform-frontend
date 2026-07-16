// =========================================================================
// DEMO / PREVIEW MODE ONLY
// -------------------------------------------------------------------------
// This intercepts window.fetch and returns realistic fake data for the SDP
// backend endpoints so the frontend can be clicked through end-to-end with
// no backend running (useful for demos, screenshots, and UI review).
//
// It is only activated when localStorage.sdp_demo_mode === "true", which is
// set automatically by visiting the app with ?demo=1 in the URL (see
// index.tsx). It should NEVER be relied on for real data.
// =========================================================================

import { API_URL } from "@/constants/envVariables";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

// ---------------------------------------------------------------------
// Shared reference data
// ---------------------------------------------------------------------
const ASSET_USDC = {
  id: "asset-usdc",
  code: "USDC",
  issuer: "GDEMOISSUERUSDC00000000000000000000000000000000000000",
};
const WALLET_VIBRANT = {
  id: "wallet-vibrant",
  name: "Vibrant Wallet",
  homepage: "https://vibrantapp.com",
};
const WALLET_BEANS = {
  id: "wallet-beans",
  name: "Beans App",
  homepage: "https://www.beansapp.com",
};

const mockProfile = {
  id: "demo-user-id",
  first_name: "Demo",
  last_name: "User",
  email: "demo@disburseflow.org",
  roles: ["owner"],
  organization_name: "SAPCONE",
};

const mockOrganization = {
  name: "SAPCONE",
  privacy_policy_link: "",
  logo_url: "",
  distribution_account_public_key: "GDEMO000000000000000000000000000000000000000000000000",
  timezone_utc_offset: "+00:00",
  is_approval_required: false,
  receiver_invitation_resend_interval_days: "3",
  is_link_shortener_enabled: false,
  is_memo_tracing_enabled: false,
  base_url: API_URL,
  payment_cancellation_period_days: "5",
  mfa_disabled: true,
  captcha_disabled: true,
  receiver_invitations_disabled: false,
  distribution_account: {
    address: "GDEMO000000000000000000000000000000000000000000000000",
    status: "ACTIVE",
    type: "DISTRIBUTION_ACCOUNT.STELLAR.ENV",
  },
};

// ---------------------------------------------------------------------
// Disbursements
// ---------------------------------------------------------------------
const disbursementSeed = [
  {
    id: "demo-disb-1",
    name: "March Cash Assistance - Nairobi",
    status: "COMPLETED",
    total: 1000,
    sent: 1000,
    failed: 0,
    canceled: 0,
  },
  {
    id: "demo-disb-2",
    name: "Emergency Relief - Turkana County",
    status: "STARTED",
    total: 500,
    sent: 340,
    failed: 12,
    canceled: 0,
  },
  {
    id: "demo-disb-3",
    name: "April School Fee Support",
    status: "READY",
    total: 250,
    sent: 0,
    failed: 0,
    canceled: 0,
  },
  {
    id: "demo-disb-4",
    name: "Draft - Mombasa Flood Response",
    status: "DRAFT",
    total: 0,
    sent: 0,
    failed: 0,
    canceled: 0,
  },
];

const mockDisbursement = (seed: (typeof disbursementSeed)[number], i: number) => ({
  id: seed.id,
  name: seed.name,
  wallet: WALLET_VIBRANT,
  asset: ASSET_USDC,
  status: seed.status,
  status_history: [
    { user_id: "demo-user-id", status: "DRAFT", timestamp: daysAgo(10 - i) },
    { user_id: "demo-user-id", status: seed.status, timestamp: daysAgo(9 - i) },
  ],
  receiver_registration_message_template:
    "You have received a payment from SAPCONE. Download the wallet to claim it.",
  registration_contact_type: "PHONE_NUMBER",
  created_at: daysAgo(10 - i),
  updated_at: daysAgo(1),
  created_by: { id: "demo-user-id", first_name: "Demo", last_name: "User" },
  started_by:
    seed.status !== "DRAFT" && seed.status !== "READY"
      ? { id: "demo-user-id", first_name: "Demo", last_name: "User" }
      : undefined,
  total_payments: seed.total,
  total_payments_sent: seed.sent,
  total_payments_failed: seed.failed,
  total_payments_canceled: seed.canceled,
  total_payments_remaining: Math.max(seed.total - seed.sent - seed.failed - seed.canceled, 0),
  amount_disbursed: (seed.sent * 45).toFixed(2),
  total_amount: (seed.total * 45).toFixed(2),
  average_amount: "45.00",
  file_name:
    seed.status === "DRAFT" ? undefined : `${seed.name.toLowerCase().replace(/\s+/g, "-")}.csv`,
});

const allMockDisbursements = disbursementSeed.map(mockDisbursement);

// ---------------------------------------------------------------------
// Receivers
// ---------------------------------------------------------------------
const receiverNames = [
  "Amina Yusuf",
  "Brian Otieno",
  "Cynthia Wanjiru",
  "David Kimani",
  "Esther Nakato",
  "Faisal Abdi",
];

const mockReceiver = (i: number) => ({
  created_at: daysAgo(20 - i),
  id: `demo-receiver-${i}`,
  phone_number: `+2547${String(10000000 + i).slice(0, 8)}`,
  external_id: `SAPCONE-${1000 + i}`,
  total_payments: 3,
  successful_payments: i % 4 === 0 ? 2 : 3,
  failed_payments: i % 4 === 0 ? 1 : 0,
  canceled_payments: 0,
  remaining_payments: 0,
  received_amounts: [
    { asset_code: "USDC", asset_issuer: ASSET_USDC.issuer, received_amount: "135.00" },
  ],
  registered_wallets: "1",
  wallets: [
    {
      id: `demo-receiver-wallet-${i}`,
      receiver: { id: `demo-receiver-${i}` },
      wallet: WALLET_VIBRANT,
      stellar_address: `GDEMORECEIVER${i}00000000000000000000000000000000000000`,
      stellar_memo: "",
      stellar_memo_type: "",
      status: "REGISTERED",
      created_at: daysAgo(20 - i),
      updated_at: daysAgo(1),
      invited_at: daysAgo(20 - i),
      last_sms_sent: daysAgo(19 - i),
      total_payments: 3,
      payments_received: 3,
      failed_payments: 0,
      remaining_payments: 0,
      received_amounts: [{ asset_code: "USDC", received_amount: "135.00" }],
    },
  ],
  verifications: [],
  name: receiverNames[i % receiverNames.length],
});

const allMockReceivers = Array.from({ length: 6 }, (_, i) => mockReceiver(i + 1));

// ---------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------
const paymentStatuses = ["SUCCESS", "SUCCESS", "PENDING", "FAILED"];

const mockPayment = (i: number) => ({
  id: `demo-payment-${i}`,
  amount: "45.00",
  stellar_transaction_id: `demo-tx-${i}`,
  stellar_operation_id: `demo-op-${i}`,
  stellar_address: `GDEMORECEIVER${i}00000000000000000000000000000000000000`,
  status: paymentStatuses[i % paymentStatuses.length],
  status_history: [
    { status: "PENDING", status_message: "Payment queued", timestamp: daysAgo(5) },
    {
      status: paymentStatuses[i % paymentStatuses.length],
      status_message: "",
      timestamp: daysAgo(4),
    },
  ],
  type: "DISBURSEMENT" as const,
  disbursement: {
    id: allMockDisbursements[i % allMockDisbursements.length].id,
    name: allMockDisbursements[i % allMockDisbursements.length].name,
    status: allMockDisbursements[i % allMockDisbursements.length].status,
    created_at: daysAgo(6),
    updated_at: daysAgo(4),
  },
  asset: ASSET_USDC,
  receiver_wallet: {
    id: `demo-receiver-wallet-${(i % 6) + 1}`,
    receiver: { id: `demo-receiver-${(i % 6) + 1}` },
    wallet: { id: WALLET_VIBRANT.id, name: WALLET_VIBRANT.name },
    stellar_address: `GDEMORECEIVER${(i % 6) + 1}00000000000000000000000000000000000000`,
    status: "REGISTERED",
    created_at: daysAgo(10),
    updated_at: daysAgo(4),
  },
  created_at: daysAgo(6),
  updated_at: daysAgo(4),
});

const allMockPayments = Array.from({ length: 12 }, (_, i) => mockPayment(i + 1));

// ---------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------
const mockStatistics = {
  payment_counters: {
    canceled: 2,
    draft: 3,
    ready: 4,
    pending: 5,
    paused: 0,
    success: 42,
    failed: 3,
    total: 59,
  },
  receiver_wallets_counters: { draft: 2, ready: 5, registered: 40, flagged: 1, total: 48 },
  payment_amounts_by_asset: [
    {
      asset_code: "USDC",
      payment_amounts: {
        canceled: 0,
        draft: 0,
        ready: 0,
        pending: 0,
        paused: 0,
        success: 12500,
        failed: 0,
        average: 297.6,
        total: 12500,
      },
    },
  ],
  total_disbursements: allMockDisbursements.length,
  total_receivers: allMockReceivers.length,
};

// ---------------------------------------------------------------------
// Wallets / Assets / Users
// ---------------------------------------------------------------------
const mockWallets = [
  {
    ...WALLET_VIBRANT,
    deep_link_schema: "vibrant://",
    enabled: true,
    assets: [ASSET_USDC],
    created_at: daysAgo(60),
    updated_at: daysAgo(1),
    user_managed: false,
  },
  {
    ...WALLET_BEANS,
    deep_link_schema: "beansapp://",
    enabled: true,
    assets: [ASSET_USDC],
    created_at: daysAgo(60),
    updated_at: daysAgo(1),
    user_managed: false,
  },
];

const mockAssets = [{ ...ASSET_USDC, created_at: daysAgo(90), updated_at: daysAgo(1) }];

const mockUsers = [
  {
    id: "demo-user-id",
    first_name: "Demo",
    last_name: "User",
    email: "demo@disburseflow.org",
    roles: ["owner"],
    is_active: true,
  },
  {
    id: "demo-user-2",
    first_name: "Abigael",
    last_name: "Nyangasi",
    email: "abigael@sapcone.org",
    roles: ["financial_controller"],
    is_active: true,
  },
  {
    id: "demo-user-3",
    first_name: "Peter",
    last_name: "Wesly",
    email: "peter@sapcone.org",
    roles: ["developer"],
    is_active: true,
  },
];

// A tiny 1x1 transparent PNG, used so <img> tags don't break.
const BLANK_PNG_BYTES = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  ),
  (c) => c.charCodeAt(0),
);

// ---------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------
export const installDemoApiMock = () => {
  console.log(
    "%c[Demo Mode] API mock installed. API_URL =",
    "color: #7c3aed; font-weight: bold;",
    API_URL,
  );

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    // Only intercept calls aimed at our own backend; let everything else
    // (recaptcha, fonts, etc.) go through normally.
    if (!url.startsWith(API_URL)) {
      return originalFetch(input, init);
    }

    const path = url.slice(API_URL.length).split("?")[0];
    const segments = path.split("/").filter(Boolean);
    const method = (init?.method || "GET").toUpperCase();

    console.log("%c[Demo Mode] intercepted", "color: #7c3aed;", method, path);

    // ---- Simple, fixed-shape endpoints ----
    if (method === "GET" && path === "/profile") return jsonResponse(mockProfile);
    if (method === "GET" && path === "/organization") return jsonResponse(mockOrganization);
    if (method === "GET" && path === "/organization/logo") {
      return new Response(BLANK_PNG_BYTES, {
        status: 200,
        headers: { "Content-Type": "image/png" },
      });
    }
    if (method === "GET" && path === "/statistics") return jsonResponse(mockStatistics);
    if (method === "GET" && path === "/wallets") return jsonResponse(mockWallets);
    if (method === "GET" && path === "/assets") return jsonResponse(mockAssets);
    if (method === "GET" && path === "/users") return jsonResponse(mockUsers);
    if (method === "GET" && path === "/users/roles") {
      return jsonResponse(["owner", "financial_controller", "developer", "business"]);
    }
    if (method === "GET" && path === "/receivers/verification-types") {
      return jsonResponse(["DATE_OF_BIRTH", "NATIONAL_ID_NUMBER", "PIN"]);
    }
    if (method === "GET" && path === "/registration-contact-types") {
      return jsonResponse(["PHONE_NUMBER", "EMAIL"]);
    }

    // ---- Disbursements ----
    if (method === "GET" && path === "/disbursements") {
      return jsonResponse({
        data: allMockDisbursements,
        pagination: { pages: 1, total: allMockDisbursements.length },
      });
    }
    if (method === "GET" && segments[0] === "disbursements" && segments.length === 2) {
      const found = allMockDisbursements.find((d) => d.id === segments[1]);
      return found ? jsonResponse(found) : jsonResponse({ error: "not found" }, 404);
    }
    if (method === "GET" && segments[0] === "disbursements" && segments[2] === "receivers") {
      return jsonResponse({ data: [], pagination: { pages: 0, total: 0 } });
    }

    // ---- Payments ----
    if (method === "GET" && path === "/payments") {
      return jsonResponse({
        data: allMockPayments,
        pagination: { pages: 1, total: allMockPayments.length },
      });
    }
    if (method === "GET" && segments[0] === "payments" && segments.length === 2) {
      const found = allMockPayments.find((p) => p.id === segments[1]);
      return found ? jsonResponse(found) : jsonResponse({ error: "not found" }, 404);
    }

    // ---- Receivers ----
    if (method === "GET" && path === "/receivers") {
      return jsonResponse({
        data: allMockReceivers,
        pagination: { pages: 1, total: allMockReceivers.length },
      });
    }
    if (method === "GET" && segments[0] === "receivers" && segments.length === 2) {
      const found = allMockReceivers.find((r) => r.id === segments[1]);
      return found ? jsonResponse(found) : jsonResponse({ error: "not found" }, 404);
    }

    // ---- Generic graceful fallback ----
    // Any other GET under the API returns an empty list instead of a hard
    // network error, so pages don't show scary error banners.
    if (method === "GET") {
      return jsonResponse({ data: [], pagination: { pages: 0, total: 0 } });
    }

    // Any write (POST/PATCH/DELETE) just succeeds with an empty body.
    return jsonResponse({});
  };
};
