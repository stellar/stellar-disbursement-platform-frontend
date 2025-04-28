import { useQuery } from "@tanstack/react-query";
import { HORIZON_URL } from "constants/envVariables";
import { fetchStellarApi } from "helpers/fetchStellarApi";
import { ApiStellarAccount, AppError } from "types";

export const useStellarAccountInfo = (stellarAddress: string | undefined) => {
  const query = useQuery<ApiStellarAccount, AppError>({
    queryKey: ["stellar", "accounts", stellarAddress],
    queryFn: async () => {
      if (!stellarAddress) {
        return {};
      }

      return await fetchStellarApi(
        `${HORIZON_URL}/accounts/${stellarAddress}`,
        undefined,
        {
          notFoundMessage: `${stellarAddress} address was not found.`,
        },
      );
    },
    enabled: Boolean(stellarAddress),
  });

  return query;
};
