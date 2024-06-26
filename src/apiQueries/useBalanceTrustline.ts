import { useQuery } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { ApiAsset, AppError, AccountBalanceItem } from "types";

type Trustline = {
  id: string | null;
  code: string;
  issuer: string;
  balance: string;
  isNative: boolean;
};

export const useBalanceTrustline = (
  balances?: AccountBalanceItem[] | undefined,
) => {
  const query = useQuery<Trustline[] | undefined, AppError>({
    queryKey: ["trustlines", { balances }],
    queryFn: async () => {
      const response = await fetchApi(`${API_URL}/assets`);

      return balances?.map((b) => {
        const id =
          response?.find(
            (a: ApiAsset) =>
              a.code === b?.assetCode && a.issuer === b?.assetIssuer,
          )?.id || null;

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
