import { createContext, useContext, useState, ReactNode } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { localStorageSelectedWallet } from "@/helpers/localStorageSelectedWallet";

type SelectedWalletContextValue = {
  // "" means "All accounts" (Owners: tenant-wide aggregate).
  selectedWalletId: string;
  setSelectedWalletId: (walletId: string) => void;
};

const SelectedWalletContext = createContext<SelectedWalletContextValue | undefined>(undefined);

// App-wide selected distribution (sending) account. This is the single source of truth for
// which account the user is currently acting on. It backs the always-visible ActiveWalletBar
// and is persisted to localStorage so fetchApi attaches the matching X-Wallet-Id to every
// request. Changing it invalidates react-query caches so every wallet-scoped view refetches.
export const SelectedWalletProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [selectedWalletId, setSelected] = useState<string>(
    () => localStorageSelectedWallet.get() ?? "",
  );

  const setSelectedWalletId = (walletId: string) => {
    setSelected(walletId);
    if (walletId) {
      localStorageSelectedWallet.set(walletId);
    } else {
      localStorageSelectedWallet.remove();
    }
    // Refetch every wallet-scoped query with the new X-Wallet-Id header.
    queryClient.invalidateQueries();
  };

  return (
    <SelectedWalletContext.Provider value={{ selectedWalletId, setSelectedWalletId }}>
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
