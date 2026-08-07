import { getSdpTenantName } from "@/helpers/getSdpTenantName";
import { localStorageSessionToken } from "@/helpers/localStorageSessionToken";
import { parseJwt } from "@/helpers/parseJwt";

const SELECTED_WALLET_KEY_PREFIX = "sdp_selected_distribution_wallet_id";

// The selection belongs to one (tenant, user) pair. A single global key let the previous
// user's choice ride into the next login's first requests on a shared browser.
const selectedWalletStorageKey = (): string => {
  const token = localStorageSessionToken.get();
  const userId = token ? (parseJwt(token)?.user?.id ?? "") : "";
  return `${SELECTED_WALLET_KEY_PREFIX}:${getSdpTenantName()}:${userId}`;
};

// The selected distribution wallet (the tenant's SENDING account — unrelated to recipient
// wallet providers). When a concrete account is set, every API request carries it via the
// X-Wallet-Id header and dashboards scope to it.
//
// Stored values:
//   null    — the user has never made a choice (fresh login) → the app defaults them to their
//             default distribution account so write flows work immediately.
//   "all"   — the user explicitly chose "All accounts" (Owners: tenant-wide aggregate). Kept
//             distinct from `null` so an explicit choice sticks across reloads instead of
//             snapping back to the default account.
//   "<id>"  — a specific distribution wallet id.
export const ALL_ACCOUNTS = "all";

export const localStorageSelectedWallet = {
  // Returns the raw stored value: null | "all" | "<id>".
  get: () => {
    return localStorage.getItem(selectedWalletStorageKey());
  },
  // Persists the selection. An empty string means "All accounts" and is stored as the sentinel.
  set: (walletId: string) => {
    return localStorage.setItem(selectedWalletStorageKey(), walletId || ALL_ACCOUNTS);
  },
  remove: () => {
    return localStorage.removeItem(selectedWalletStorageKey());
  },
};

// The distribution wallet id to send as X-Wallet-Id, or null when scoping to all accounts /
// nothing chosen yet. Centralizes the "all"/null handling so the raw fetch helpers agree with
// the React context.
export const getScopedWalletId = (): string | null => {
  const raw = localStorageSelectedWallet.get();
  return raw && raw !== ALL_ACCOUNTS ? raw : null;
};
