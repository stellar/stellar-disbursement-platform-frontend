import { useCallback, useEffect, useRef, useState } from "react";

import { Floater, Icon } from "@stellar/design-system";

import { AssetAmount } from "@/components/AssetAmount";
import { DistributionAccountLabel } from "@/components/DistributionAccountLabel";

import { useDistributionWalletBalance } from "@/apiQueries/useDistributionWalletBalance";
import { useDistributionWallets } from "@/apiQueries/useDistributionWallets";

import { parseAssetKey } from "@/helpers/parseAssetKey";

import { useRedux } from "@/hooks/useRedux";
import { useSelectedWallet } from "@/hooks/useSelectedWallet";

import "./styles.scss";

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
  const { data, isLoading, isError } = useDistributionWalletBalance(isAuthenticated, walletId);
  const balances = Object.entries(data?.balances ?? {});
  const nonZero = balances.filter(([, amount]) => Number(amount) > 0);
  const toShow = (nonZero.length ? nonZero : balances).slice(0, 3);

  if (isLoading) {
    return <span className="WalletSwitcher__balance WalletSwitcher__balance--muted">…</span>;
  }
  if (isError) {
    return (
      <span className="WalletSwitcher__balance WalletSwitcher__balance--muted">
        balance unavailable
      </span>
    );
  }
  if (!toShow.length) {
    return (
      <span className="WalletSwitcher__balance WalletSwitcher__balance--muted">no funds yet</span>
    );
  }
  return (
    <span className="WalletSwitcher__balance">
      {toShow.map(([assetKey, amount]) => (
        <AssetAmount
          key={assetKey}
          amount={amount || "0"}
          assetCode={parseAssetKey(assetKey).code}
        />
      ))}
    </span>
  );
};

// The active distribution account, prominent on every page, with a rich switcher menu so a
// user managing several accounts always knows which one they're acting on (and which has
// funds). Single-account users get a static (non-interactive) bar so the account name is
// still always on screen. Patterned on account switchers in Stripe / Mercury / Vercel /
// Linear: current context as the trigger, a menu of rows with a color mark, live balance,
// and an active checkmark.
export const ActiveWalletBar = () => {
  const { userAccount } = useRedux("userAccount");
  const { selectedWalletId, setSelectedWalletId, hasChosenWallet } = useSelectedWallet();
  const {
    data: wallets,
    isLoading,
    isError,
    refetch,
  } = useDistributionWallets(userAccount.isAuthenticated);

  // We drive the menu open/close ourselves (Floater controlled mode via `isVisible`) so we
  // can close on selection, close on Escape, and support keyboard navigation — none of which
  // the uncontrolled Floater does. `isOpen` also gates lazy per-row balance fetches.
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback((restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  }, []);

  // Reconcile the selection against the accounts this user can actually see. On a fresh login
  // we land on a concrete account (the default distribution account, else the first accessible
  // one) so every request carries an X-Wallet-Id and create/disbursement flows work without a
  // "pick an account" dead-end. This matters even for a single-account member of a multi-wallet
  // tenant, where the backend still requires the header. An explicit "All accounts" choice
  // (hasChosenWallet) is respected and left alone.
  useEffect(() => {
    if (!wallets || wallets.length === 0) {
      return;
    }
    const defaultWalletId = (wallets.find((w) => w.is_default) ?? wallets[0]).id;

    // Exactly one accessible account: there is nothing to aggregate, and the static bar below
    // names that account — so pin to it regardless of any earlier "All accounts" choice. A
    // stale "all" (stored before entitlements narrowed) leaves hasChosenWallet true and
    // selectedWalletId "", which both checks below skip, and every request then goes out with
    // no X-Wallet-Id — which the backend rejects for writes in a multi-wallet tenant.
    if (wallets.length === 1) {
      // Guarded: an unconditional set would re-run this effect via a new `wallets` identity.
      if (selectedWalletId !== wallets[0].id) {
        setSelectedWalletId(wallets[0].id);
      }
      return;
    }

    // A stored selection that no longer exists (different login, archived) → reset to a valid one.
    if (selectedWalletId && !wallets.some((w) => w.id === selectedWalletId)) {
      setSelectedWalletId(defaultWalletId);
      return;
    }

    // Never chosen yet (fresh login) → default to a concrete account.
    if (!hasChosenWallet && !selectedWalletId) {
      setSelectedWalletId(defaultWalletId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets, selectedWalletId, hasChosenWallet]);

  // Controlled Floater no longer auto-closes on outside click, so we do it: any pointer down
  // outside the bar (including on a button that opens a modal) dismisses the menu.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  // Move focus into the menu when it opens so keyboard users land on the active option.
  useEffect(() => {
    if (!isOpen || !menuRef.current) {
      return;
    }
    const options = menuRef.current.querySelectorAll<HTMLElement>('[role="option"]');
    const active =
      menuRef.current.querySelector<HTMLElement>('[aria-selected="true"]') ?? options[0];
    active?.focus();
  }, [isOpen]);

  // Arrow-key roving + Escape/Tab dismissal on the listbox.
  const onMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
      return;
    }
    if (event.key === "Tab") {
      closeMenu();
      return;
    }
    if (!menuRef.current) {
      return;
    }
    const options = Array.from(menuRef.current.querySelectorAll<HTMLElement>('[role="option"]'));
    const currentIndex = options.indexOf(document.activeElement as HTMLElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      options[(currentIndex + 1) % options.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      options[(currentIndex - 1 + options.length) % options.length]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      options[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      options[options.length - 1]?.focus();
    }
  };

  const selectWallet = (walletId: string) => {
    setSelectedWalletId(walletId);
    closeMenu(true);
  };

  if (!userAccount.isAuthenticated) {
    return null;
  }

  // Reserve the bar's height while the account list loads so the page doesn't jump.
  if (isLoading) {
    return (
      <div className="ActiveWalletBar" aria-hidden="true">
        <div className="ActiveWalletBar__trigger ActiveWalletBar__trigger--placeholder">
          <span className="ActiveWalletBar__labelStack">
            <span className="ActiveWalletBar__label">Distribution account</span>
            <span className="ActiveWalletBar__value ActiveWalletBar__value--all">Loading…</span>
          </span>
        </div>
      </div>
    );
  }

  // A failed account fetch must be visible — X-Wallet-Id keeps scoping requests even when
  // this bar can't render, so silence would hide which account the user is acting on.
  if (isError) {
    return (
      <div className="ActiveWalletBar" role="region" aria-label="Active distribution account">
        <button
          type="button"
          className="ActiveWalletBar__trigger ActiveWalletBar__trigger--error"
          onClick={() => refetch()}
          aria-label="Retry loading distribution accounts"
        >
          <span className="ActiveWalletBar__labelStack">
            <span className="ActiveWalletBar__label">Distribution account</span>
            <span className="ActiveWalletBar__value ActiveWalletBar__value--all">
              Couldn’t load accounts. Click to retry.
            </span>
          </span>
        </button>
      </div>
    );
  }

  if (!wallets || wallets.length === 0) {
    return null;
  }

  // Single-account users (e.g. a country officer granted one account) still need to know
  // which account they're on — show the bar without a menu.
  if (wallets.length === 1) {
    const only = wallets[0];
    return (
      <div className="ActiveWalletBar" role="region" aria-label="Active distribution account">
        <div className="ActiveWalletBar__trigger ActiveWalletBar__trigger--static">
          <span className="ActiveWalletBar__icon" aria-hidden="true">
            <Icon.Dataflow01 />
          </span>
          <span className="ActiveWalletBar__labelStack">
            <span className="ActiveWalletBar__label">Distribution account</span>
            <span className="ActiveWalletBar__value">
              <DistributionAccountLabel wallet={only} defaultMarker="text" />
            </span>
          </span>
        </div>
      </div>
    );
  }

  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);
  const isAllAccounts = !selectedWalletId;

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      className="ActiveWalletBar__trigger"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      onClick={() => setIsOpen((open) => !open)}
    >
      <span className="ActiveWalletBar__icon" aria-hidden="true">
        <Icon.Dataflow01 />
      </span>
      <span className="ActiveWalletBar__labelStack">
        <span className="ActiveWalletBar__label">Distribution account</span>
        <span
          className={`ActiveWalletBar__value ${isAllAccounts ? "ActiveWalletBar__value--all" : ""}`}
        >
          {selectedWallet ? (
            <DistributionAccountLabel wallet={selectedWallet} defaultMarker="text" />
          ) : isAllAccounts ? (
            "All accounts"
          ) : null}
        </span>
      </span>
      <span className="ActiveWalletBar__chevron" aria-hidden="true">
        <Icon.ChevronSelectorVertical />
      </span>
    </button>
  );

  return (
    <div
      className="ActiveWalletBar"
      role="region"
      aria-label="Active distribution account"
      ref={containerRef}
    >
      <Floater
        triggerEl={trigger}
        placement="bottom"
        isContrast={false}
        offset={6}
        isVisible={isOpen}
      >
        <div
          className="WalletSwitcher"
          role="listbox"
          aria-label="Switch distribution account"
          ref={menuRef}
          onKeyDown={onMenuKeyDown}
        >
          <button
            type="button"
            role="option"
            aria-selected={isAllAccounts}
            className={`WalletSwitcher__item ${isAllAccounts ? "WalletSwitcher__item--active" : ""}`}
            onClick={() => selectWallet("")}
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
                onClick={() => selectWallet(wallet.id)}
              >
                <span className="WalletSwitcher__main">
                  <span className="WalletSwitcher__name">
                    <DistributionAccountLabel wallet={wallet} defaultMarker="badge" />
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
