import { useMutation } from "@tanstack/react-query";
import { API_URL } from "@/constants/envVariables";
import { fetchApi } from "@/helpers/fetchApi";
import { useSelectedWallet } from "@/hooks/useSelectedWallet";
import { ApiAsset, AppError } from "@/types";

type Asset = {
  assetCode: string;
  assetIssuer: string;
};

// Adding an asset issues a ChangeTrust, and the backend resolves which account to issue it on
// from X-Wallet-Id (falling back to the tenant default when the header is absent). Without the
// header the trustline always landed on the default account, so a secondary account could never
// acquire one after creation. The account comes from the shared selection context — the same
// source the ActiveWalletBar renders — never from localStorage at request time, so the trustline
// lands on the account the operator is looking at. "All accounts" ("") sends no header and keeps
// the pre-existing default-account behaviour.
export const useAssetsAdd = ({ onSuccess }: { onSuccess: (addedAsset: ApiAsset) => void }) => {
  const { selectedWalletId } = useSelectedWallet();

  const mutation = useMutation({
    mutationFn: ({ assetCode, assetIssuer }: Asset) => {
      return fetchApi(
        `${API_URL}/assets`,
        {
          method: "POST",
          body: JSON.stringify({
            code: assetCode,
            issuer: assetIssuer,
          }),
        },
        { walletId: selectedWalletId || null },
      );
    },
    onSuccess,
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as ApiAsset,
    mutateAsync: async ({ assetCode, assetIssuer }: Asset) => {
      try {
        await mutation.mutateAsync({ assetCode, assetIssuer });
      } catch {
        // do nothing
      }
    },
  };
};
