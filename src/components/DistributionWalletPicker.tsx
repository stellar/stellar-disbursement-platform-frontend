import { Select } from "@stellar/design-system";

import { useDistributionWallets } from "@/apiQueries/useDistributionWallets";

import { useRedux } from "@/hooks/useRedux";

type DistributionWalletPickerProps = {
  value: string;
  onSelect: (walletId: string) => void;
};

// Distribution wallet picker (the tenant's SENDING accounts — not recipient wallet
// providers). Selecting a wallet scopes every dashboard and API request via X-Wallet-Id;
// "All wallets" clears the selection (Owners: tenant-wide aggregate). Selection state is
// owned by the parent so the dashboard re-renders + refetches immediately on change.
export const DistributionWalletPicker = ({ value, onSelect }: DistributionWalletPickerProps) => {
  const { userAccount } = useRedux("userAccount");
  const { data: wallets } = useDistributionWallets(userAccount.isAuthenticated);

  // Single-wallet tenants (pre-opt-in) need no picker.
  if (!wallets || wallets.length < 2) {
    return null;
  }

  return (
    // Constrained width (fits under the "Dashboard" title) + spacing from the stat cards.
    <div className="DistributionWalletPicker" style={{ maxWidth: "260px", marginBottom: "1.5rem" }}>
      <Select
        id="distribution-wallet-picker"
        fieldSize="sm"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSelect(e.target.value)}
      >
        <option value="">All wallets</option>
        {wallets.map((wallet) => (
          <option key={wallet.id} value={wallet.id}>
            {wallet.name}
            {wallet.is_default ? " (default)" : ""}
          </option>
        ))}
      </Select>
    </div>
  );
};
