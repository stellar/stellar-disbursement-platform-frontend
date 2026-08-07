import { createContext, useContext, useState, ReactNode } from "react";

import { getSdpTenantName } from "@/helpers/getSdpTenantName";
import { ALL_ACCOUNTS, localStorageSelectedWallet } from "@/helpers/localStorageSelectedWallet";
import { parseJwt } from "@/helpers/parseJwt";

import { useRedux } from "@/hooks/useRedux";

type SelectedWalletContextValue = {
  // "" means "All accounts" (Owners: tenant-wide aggregate).
  selectedWalletId: string;
  setSelectedWalletId: (walletId: string) => void;
  // False until the user (or the default-account bootstrap) has committed a selection. Lets the
  // ActiveWalletBar default a fresh login to the default account without clobbering an explicit
  // "All accounts" choice on reload.
  hasChosenWallet: boolean;
};

const SelectedWalletContext = createContext<SelectedWalletContextValue | undefined>(undefined);

// App-wide selected distribution (sending) account. This is the single source of truth for
// which account the user is currently acting on: it backs the always-visible ActiveWalletBar,
// and every wallet-scoped query keys on it and hands it to fetchApi as the X-Wallet-Id. It is
// persisted to localStorage only to bootstrap the next page load for this (tenant, user).
const SelectedWalletProviderInner = ({ children }: { children: ReactNode }) => {
  const initialRaw = localStorageSelectedWallet.get(); // null | "all" | "<id>"
  const [selectedWalletId, setSelected] = useState<string>(() =>
    initialRaw && initialRaw !== ALL_ACCOUNTS ? initialRaw : "",
  );
  // null means the user has never chosen — the bar will default them to their default account.
  const [hasChosenWallet, setHasChosenWallet] = useState<boolean>(() => initialRaw !== null);

  const setSelectedWalletId = (walletId: string) => {
    setSelected(walletId);
    setHasChosenWallet(true);
    // Persists "" as the "all" sentinel so the explicit choice survives a reload.
    localStorageSelectedWallet.set(walletId);
  };

  return (
    <SelectedWalletContext.Provider
      value={{ selectedWalletId, setSelectedWalletId, hasChosenWallet }}
    >
      {children}
    </SelectedWalletContext.Provider>
  );
};

export const SelectedWalletProvider = ({ children }: { children: ReactNode }) => {
  const { userAccount } = useRedux("userAccount");
  const userId = userAccount.token ? (parseJwt(userAccount.token)?.user?.id ?? "") : "";

  // Remount on identity change so the state above is re-seeded from THIS user's namespaced
  // storage entry. Without it the provider outlives sign-out and the next user acts on the
  // previous user's account until the ActiveWalletBar happens to reconcile.
  return (
    <SelectedWalletProviderInner key={`${getSdpTenantName()}:${userId}`}>
      {children}
    </SelectedWalletProviderInner>
  );
};

export const useSelectedWallet = () => {
  const ctx = useContext(SelectedWalletContext);
  if (!ctx) {
    throw new Error("useSelectedWallet must be used within a SelectedWalletProvider");
  }
  return ctx;
};
