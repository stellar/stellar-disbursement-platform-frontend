import { useQueryClient } from "@tanstack/react-query";

import { Select } from "@stellar/design-system";

import { useDistributionWallets } from "@/apiQueries/useDistributionWallets";

import { localStorageSelectedWallet } from "@/helpers/localStorageSelectedWallet";

import { useRedux } from "@/hooks/useRedux";

// Distribution wallet picker (the tenant's SENDING accounts — not recipient wallet
// providers). Selecting a wallet scopes every dashboard and API request via X-Wallet-Id;
// "All wallets" clears the selection (Owners: tenant-wide aggregate).
export const DistributionWalletPicker = () => {
  const { userAccount } = useRedux("userAccount");
  const queryClient = useQueryClient();
  const { data: wallets } = useDistributionWallets(userAccount.isAuthenticated);

  // Single-wallet tenants (pre-opt-in) need no picker.
  if (!wallets || wallets.length < 2) {
    return null;
  }

  const selectedWalletId = localStorageSelectedWallet.get() ?? "";

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const walletId = event.target.value;
    if (walletId) {
      localStorageSelectedWallet.set(walletId);
    } else {
      localStorageSelectedWallet.remove();
    }
    // Every wallet-scoped query refetches with the new X-Wallet-Id.
    queryClient.invalidateQueries();
  };

  return (
    <Select
      id="distribution-wallet-picker"
      fieldSize="sm"
      value={selectedWalletId}
      onChange={handleChange}
    >
      <option value="">All wallets</option>
      {wallets.map((wallet) => (
        <option key={wallet.id} value={wallet.id}>
          {wallet.name}
          {wallet.is_default ? " (default)" : ""}
        </option>
      ))}
    </Select>
  );
};
