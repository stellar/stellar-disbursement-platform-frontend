import { createContext, useContext, useState, ReactNode } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { ALL_ACCOUNTS, localStorageSelectedWallet } from "@/helpers/localStorageSelectedWallet";

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
// which account the user is currently acting on. It backs the always-visible ActiveWalletBar
// and is persisted to localStorage so fetchApi attaches the matching X-Wallet-Id to every
// request. Changing it invalidates react-query caches so every wallet-scoped view refetches.
export const SelectedWalletProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
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
    // Refetch every wallet-scoped query with the new X-Wallet-Id header.
    queryClient.invalidateQueries();
  };

  return (
    <SelectedWalletContext.Provider
      value={{ selectedWalletId, setSelectedWalletId, hasChosenWallet }}
    >
      {children}
    </SelectedWalletContext.Provider>
  );
};

export const useSelectedWallet = () => {
  const ctx = useContext(SelectedWalletContext);
  if (!ctx) {
    throw new Error("useSelectedWallet must be used within a SelectedWalletProvider");
  }
  return ctx;
};
