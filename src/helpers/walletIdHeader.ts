import { localStorageSelectedWallet } from "@/helpers/localStorageSelectedWallet";

// Multi-wallet: attach the selected distribution (source) account to write/read calls that go
// through the raw fetch() helpers instead of fetchApi. The backend requires X-Wallet-Id on
// tenants with more than one distribution wallet (e.g. creating a disbursement), so these
// hand-rolled fetch calls must send it too. Empty when "All accounts" is selected.
export const walletIdHeader = (): Record<string, string> => {
  const walletId = localStorageSelectedWallet.get();
  return walletId ? { "X-Wallet-Id": walletId } : {};
};
