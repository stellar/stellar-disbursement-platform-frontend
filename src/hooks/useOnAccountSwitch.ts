import { useEffect, useRef } from "react";

import { useSelectedWallet } from "@/hooks/useSelectedWallet";

// Runs `onSwitch` when the user switches distribution account. On a fresh login the account bar
// bootstraps "" to the default account after mount; that first selection is not a switch.
// Pass a stable callback (useCallback): a new one re-runs the check.
export const useOnAccountSwitch = (onSwitch: () => void) => {
  const { selectedWalletId, hasChosenWallet } = useSelectedWallet();
  const activeWalletRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hasChosenWallet) {
      return;
    }

    if (activeWalletRef.current === null) {
      activeWalletRef.current = selectedWalletId;
      return;
    }

    if (activeWalletRef.current === selectedWalletId) {
      return;
    }

    activeWalletRef.current = selectedWalletId;
    onSwitch();
  }, [hasChosenWallet, onSwitch, selectedWalletId]);
};
