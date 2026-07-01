import { useEffect, useState } from "react";

import { Floater, Icon } from "@stellar/design-system";

import { AssetAmount } from "@/components/AssetAmount";

import { useDistributionWalletBalance } from "@/apiQueries/useDistributionWalletBalance";
import { useDistributionWallets } from "@/apiQueries/useDistributionWallets";

import { useRedux } from "@/hooks/useRedux";
import { useSelectedWallet } from "@/hooks/useSelectedWallet";

import "./styles.scss";

// Deterministic per-account color chip. Borrowed from AWS's account-color idea (red=prod,
// etc.): each account gets a stable color so users recognize "which account" at a glance,
// consistently in the trigger and every menu row.
const ACCOUNT_COLORS = [
  "#7B61FF",
  "#0EA5E9",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#8B5CF6",
  "#14B8A6",
];
const accountColor = (key: string) => {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) & 0xffffffff;
  }
  return ACCOUNT_COLORS[Math.abs(hash) % ACCOUNT_COLORS.length];
};

// Compact live balance for a menu row (Mercury/Brex: the switcher shows which account has
// funds to disburse from). Mounted only while the menu is open, so balances aren't fetched
// on every page load.
const RowBalance = ({
  walletId,
  isAuthenticated,
}: {
  walletId: string | null;
  isAuthenticated: boolean;
}) => {
  const { data, isLoading } = useDistributionWalletBalance(isAuthenticated, walletId);
  const balances = Object.entries(data?.balances ?? {});
  const nonZero = balances.filter(([, amount]) => Number(amount) > 0);
  const toShow = (nonZero.length ? nonZero : balances).slice(0, 3);

  if (isLoading) {
    return <span className="WalletSwitcher__balance WalletSwitcher__balance--muted">…</span>;
  }
  if (!toShow.length) {
    return <span className="WalletSwitcher__balance WalletSwitcher__balance--muted">—</span>;
  }
  return (
    <span className="WalletSwitcher__balance">
      {toShow.map(([assetKey, amount]) => (
        <AssetAmount key={assetKey} amount={amount || "0"} assetCode={assetKey.split(":")[0]} />
      ))}
    </span>
  );
};

// The active distribution account, prominent on every page, with a rich switcher menu so a
// user managing several accounts always knows which one they're acting on (and which has
// funds). Hidden for single-account tenants. Patterned on account switchers in
// Stripe / Mercury / Vercel / Linear: current context as the trigger, a menu of rows with a
// color mark, live balance, and an active checkmark.
export const ActiveWalletBar = () => {
  const { userAccount } = useRedux("userAccount");
  const { selectedWalletId, setSelectedWalletId } = useSelectedWallet();
  const { data: wallets } = useDistributionWallets(userAccount.isAuthenticated);

  // Tracks the menu open state (reported by Floater) so per-row balances are fetched lazily.
  const [isOpen, setIsOpen] = useState(false);

  // If the persisted selection isn't among this user's accounts (different login, archived),
  // fall back to "All accounts".
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
  const currentLabel = isAllAccounts
    ? "All accounts"
    : `${selectedWallet?.name}${selectedWallet?.is_default ? " (default)" : ""}`;

  const trigger = (
    <button
      type="button"
      className="ActiveWalletBar__trigger"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
    >
      <span className="ActiveWalletBar__icon" aria-hidden="true">
        <Icon.Dataflow01 />
      </span>
      <span className="ActiveWalletBar__labelStack">
        <span className="ActiveWalletBar__label">Distribution account</span>
        <span
          className={`ActiveWalletBar__value ${isAllAccounts ? "ActiveWalletBar__value--all" : ""}`}
        >
          {!isAllAccounts && selectedWallet ? (
            <span
              className="ActiveWalletBar__dot"
              style={{ backgroundColor: accountColor(selectedWallet.id) }}
              aria-hidden="true"
            />
          ) : null}
          {currentLabel}
        </span>
      </span>
      <span className="ActiveWalletBar__chevron" aria-hidden="true">
        <Icon.ChevronSelectorVertical />
      </span>
    </button>
  );

  return (
    <div className="ActiveWalletBar" role="region" aria-label="Active distribution account">
      <Floater
        triggerEl={trigger}
        placement="bottom"
        isContrast={false}
        offset={6}
        callback={setIsOpen}
      >
        <div className="WalletSwitcher" role="listbox" aria-label="Switch distribution account">
          <button
            type="button"
            role="option"
            aria-selected={isAllAccounts}
            className={`WalletSwitcher__item ${isAllAccounts ? "WalletSwitcher__item--active" : ""}`}
            onClick={() => setSelectedWalletId("")}
          >
            <span className="WalletSwitcher__main">
              <span className="WalletSwitcher__name">All accounts</span>
              {isOpen ? (
                <RowBalance walletId={null} isAuthenticated={userAccount.isAuthenticated} />
              ) : null}
            </span>
            {isAllAccounts ? (
              <span className="WalletSwitcher__check" aria-hidden="true">
                <Icon.Check />
              </span>
            ) : null}
          </button>

          <div className="WalletSwitcher__divider" role="separator" />

          {wallets.map((wallet) => {
            const isActive = wallet.id === selectedWalletId;
            return (
              <button
                key={wallet.id}
                type="button"
                role="option"
                aria-selected={isActive}
                className={`WalletSwitcher__item ${isActive ? "WalletSwitcher__item--active" : ""}`}
                onClick={() => setSelectedWalletId(wallet.id)}
              >
                <span className="WalletSwitcher__main">
                  <span className="WalletSwitcher__name">
                    <span
                      className="WalletSwitcher__dot"
                      style={{ backgroundColor: accountColor(wallet.id) }}
                      aria-hidden="true"
                    />
                    {wallet.name}
                    {wallet.is_default ? (
                      <span className="WalletSwitcher__badge">default</span>
                    ) : null}
                  </span>
                  {isOpen ? (
                    <RowBalance
                      walletId={wallet.id}
                      isAuthenticated={userAccount.isAuthenticated}
                    />
                  ) : null}
                </span>
                {isActive ? (
                  <span className="WalletSwitcher__check" aria-hidden="true">
                    <Icon.Check />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </Floater>
    </div>
  );
};
