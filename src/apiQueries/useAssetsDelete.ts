import { useMutation, useQueryClient } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { fetchApi } from "@/helpers/fetchApi";

import { useSelectedWallet } from "@/hooks/useSelectedWallet";

import { ApiAsset, AppError } from "@/types";

// Removing an asset pulls the trustline off the account named by X-Wallet-Id (the tenant
// default when the header is absent); the backend retires the asset from the catalogue only once
// no active account trusts it anymore. Adding is already scoped this way
// (see useAssetsAdd); without the same header here an operator on a secondary account could add
// a trustline to the account they are looking at but Remove would silently strip it from the
// DEFAULT account instead — mutating the wrong account, which is worse than not being able to
// remove at all. The account comes from the shared selection context — the same source the
// ActiveWalletBar renders — never from localStorage at request time. "All accounts" ("") sends
// no header and keeps the pre-existing default-account behaviour.
export const useAssetsDelete = ({ onSuccess }: { onSuccess: (deletedAsset: ApiAsset) => void }) => {
  const { selectedWalletId } = useSelectedWallet();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (assetId: string) => {
      return fetchApi(
        `${API_URL}/assets/${assetId}`,
        {
          method: "DELETE",
        },
        { walletId: selectedWalletId || null },
      );
    },
    onSuccess: (deletedAsset: ApiAsset) => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      onSuccess(deletedAsset);
    },
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as ApiAsset,
    mutateAsync: async (assetId: string) => {
      try {
        await mutation.mutateAsync(assetId);
      } catch {
        // do nothing
      }
    },
  };
};
