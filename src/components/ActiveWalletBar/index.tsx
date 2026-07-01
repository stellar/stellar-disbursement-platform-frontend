import { useEffect } from "react";

import { Icon, Select } from "@stellar/design-system";

import { useDistributionWallets } from "@/apiQueries/useDistributionWallets";

import { useRedux } from "@/hooks/useRedux";
import { useSelectedWallet } from "@/hooks/useSelectedWallet";

import "./styles.scss";

// Always-visible bar that makes the active distribution (sending) account unmistakable on
// every page — so a user managing several accounts (e.g. a treasurer over Haiti + Venezuela)
// always knows which account's data they're viewing and which one funds their actions.
// Switching here re-scopes the whole app. Hidden for single-account tenants (no ambiguity).
export const ActiveWalletBar = () => {
  const { userAccount } = useRedux("userAccount");
  const { selectedWalletId, setSelectedWalletId } = useSelectedWallet();
  const { data: wallets } = useDistributionWallets(userAccount.isAuthenticated);

  // If the persisted selection isn't among the accounts this user can see (e.g. after a
  // different login, or the account was archived), fall back to "All accounts".
  useEffect(() => {
    if (selectedWalletId && wallets && !wallets.some((w) => w.id === selectedWalletId)) {
      setSelectedWalletId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets, selectedWalletId]);

  if (!userAccount.isAuthenticated || !wallets || wallets.length < 2) {
    return null;
  }

  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);
  const isAllAccounts = !selectedWalletId;

  return (
    <div className="ActiveWalletBar" role="region" aria-label="Active distribution account">
      <div className="ActiveWalletBar__context">
        <span className="ActiveWalletBar__icon" aria-hidden="true">
          <Icon.Dataflow01 />
        </span>
        <span className="ActiveWalletBar__label">Distribution account</span>
        <span
          className={`ActiveWalletBar__value ${isAllAccounts ? "ActiveWalletBar__value--all" : ""}`}
        >
          {isAllAccounts ? "All accounts" : selectedWallet?.name}
          {selectedWallet?.is_default ? " (default)" : ""}
        </span>
      </div>

      <div className="ActiveWalletBar__select">
        <Select
          id="active-wallet-bar-select"
          fieldSize="sm"
          value={selectedWalletId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSelectedWalletId(e.target.value)
          }
        >
          <option value="">All accounts</option>
          {wallets.map((wallet) => (
            <option key={wallet.id} value={wallet.id}>
              {wallet.name}
              {wallet.is_default ? " (default)" : ""}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
};
