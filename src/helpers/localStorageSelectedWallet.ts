const LOCAL_STORAGE_SELECTED_WALLET_ID = "sdp_selected_distribution_wallet_id";

// The selected distribution wallet (the tenant's SENDING account — unrelated to recipient
// wallet providers). When set, every API request carries it via the X-Wallet-Id header and
// dashboards scope to it; unset means "all my wallets" (Owners: tenant-wide).
export const localStorageSelectedWallet = {
  get: () => {
    return localStorage.getItem(LOCAL_STORAGE_SELECTED_WALLET_ID);
  },
  set: (walletId: string) => {
    return localStorage.setItem(LOCAL_STORAGE_SELECTED_WALLET_ID, walletId);
  },
  remove: () => {
    return localStorage.removeItem(LOCAL_STORAGE_SELECTED_WALLET_ID);
  },
};
