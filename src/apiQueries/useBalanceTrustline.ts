import { useQuery } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { fetchApi } from "@/helpers/fetchApi";

import { ApiAsset, AppError, AccountBalanceItem, Trustline } from "@/types";

// Deliberately unscoped, unlike the rest of the /assets calls: this hits GET /assets WITHOUT
// ?enabled, which ignores X-Wallet-Id and returns the tenant-wide asset records. That is what we
// want here — it is only used to resolve an id for each row so Remove has something to address,
// and the ids are tenant-wide (the per-account part of the removal is the X-Wallet-Id that
// useAssetsDelete sends). The per-account state — which assets this account actually trusts and
// at what balance — comes from `balances`, the caller's own Horizon balances for the account
// being viewed, so it is already the right account's and is part of the cache key. No wallet
// segment is needed: nothing in the response varies by selected account.
export const useBalanceTrustline = (balances?: AccountBalanceItem[] | undefined) => {
  const query = useQuery<Trustline[] | undefined, AppError>({
    queryKey: ["trustlines", { balances }],
    queryFn: async () => {
      const response = await fetchApi(`${API_URL}/assets`);

      return balances?.map((b) => {
        const id =
          response?.find((a: ApiAsset) => a.code === b?.assetCode && a.issuer === b?.assetIssuer)
            ?.id || null;

        return {
          id,
          code: b?.assetCode || "XLM",
          issuer: b?.assetIssuer || "native",
          balance: b.balance,
          isNative: Boolean(!b.assetCode && !b.assetIssuer),
        };
      });
    },
    enabled: Boolean(balances),
  });

  return query;
};
