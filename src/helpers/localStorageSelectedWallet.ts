const LOCAL_STORAGE_SELECTED_WALLET_ID = "sdp_selected_distribution_wallet_id";

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
    return localStorage.getItem(LOCAL_STORAGE_SELECTED_WALLET_ID);
  },
  // Persists the selection. An empty string means "All accounts" and is stored as the sentinel.
  set: (walletId: string) => {
    return localStorage.setItem(LOCAL_STORAGE_SELECTED_WALLET_ID, walletId || ALL_ACCOUNTS);
  },
  remove: () => {
    return localStorage.removeItem(LOCAL_STORAGE_SELECTED_WALLET_ID);
  },
};

// The distribution wallet id to send as X-Wallet-Id, or null when scoping to all accounts /
// nothing chosen yet. Centralizes the "all"/null handling so the raw fetch helpers agree with
// the React context.
export const getScopedWalletId = (): string | null => {
  const raw = localStorageSelectedWallet.get();
  return raw && raw !== ALL_ACCOUNTS ? raw : null;
};
