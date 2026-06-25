import { Card } from "@stellar/design-system";

import { AssetAmount } from "@/components/AssetAmount";
import { InfoTooltip } from "@/components/InfoTooltip";

import { useDistributionWalletBalance } from "@/apiQueries/useDistributionWalletBalance";
import { useDistributionWallets } from "@/apiQueries/useDistributionWallets";

import { useRedux } from "@/hooks/useRedux";

// One row = one distribution wallet + its live on-chain balances. Each row owns its own
// balance query (keyed per wallet), so the overview shows every wallet at a glance without
// touching the picker.
const WalletBalanceRow = ({
  walletId,
  name,
  isDefault,
  isAuthenticated,
}: {
  walletId: string;
  name: string;
  isDefault: boolean;
  isAuthenticated: boolean;
}) => {
  const { data, isLoading } = useDistributionWalletBalance(isAuthenticated, walletId);
  const balances = Object.entries(data?.balances ?? {});

  return (
    <div
      className="WalletBalancesOverview__row"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1rem",
        padding: "0.5rem 0",
        borderBottom: "1px solid var(--color-gray-30)",
      }}
    >
      <div style={{ fontWeight: 500 }}>
        {name}
        {isDefault ? " (default)" : ""}
      </div>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
        {isLoading ? (
          <span className="Note">…</span>
        ) : balances.length ? (
          balances.map(([assetKey, amount]) => (
            <AssetAmount key={assetKey} amount={amount || "0"} assetCode={assetKey.split(":")[0]} />
          ))
        ) : (
          <span className="Note">—</span>
        )}
      </div>
    </div>
  );
};

// All distribution wallet balances on the home screen — Paul's playtest ask: see every
// wallet's balance without switching the picker. Hidden for single-wallet tenants.
export const WalletBalancesOverview = () => {
  const { userAccount } = useRedux("userAccount");
  const { data: wallets } = useDistributionWallets(userAccount.isAuthenticated);

  if (!wallets || wallets.length < 2) {
    return null;
  }

  return (
    <Card>
      <div className="StatCards__card__title">
        <InfoTooltip infoText="Live on-chain balance of each of your distribution (sending) wallets — no need to switch the picker.">
          Wallet balances
        </InfoTooltip>
      </div>
      <div className="WalletBalancesOverview" style={{ marginTop: "0.75rem" }}>
        {wallets.map((wallet) => (
          <WalletBalanceRow
            key={wallet.id}
            walletId={wallet.id}
            name={wallet.name}
            isDefault={wallet.is_default}
            isAuthenticated={userAccount.isAuthenticated}
          />
        ))}
      </div>
    </Card>
  );
};
