// Multi-wallet: attach a distribution (source) account to write/read calls that go through the
// raw fetch() helpers instead of fetchApi. The backend requires X-Wallet-Id on tenants with more
// than one distribution wallet (e.g. creating a disbursement), so these hand-rolled fetch calls
// must send it too.
//
// The id is passed in by the caller — never read from localStorage here. localStorage is shared
// across tabs while the SelectedWallet context is not, so reading it at request time lets the
// header disagree with the account the user is looking at. Empty/undefined means "All accounts",
// which sends no header.
export const walletIdHeader = (walletId?: string | null): Record<string, string> => {
  return walletId ? { "X-Wallet-Id": walletId } : {};
};
