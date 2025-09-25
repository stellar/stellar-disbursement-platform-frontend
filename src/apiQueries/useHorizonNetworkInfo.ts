import { useQuery } from "@tanstack/react-query";

import { HORIZON_URL } from "@/constants/envVariables";
import { fetchStellarApi } from "@/helpers/fetchStellarApi";
import { AppError } from "@/types";

export type HorizonNetworkInfo = {
  network_passphrase: string;
};

export const useHorizonNetworkInfo = () => {
  const query = useQuery<HorizonNetworkInfo, AppError>({
    queryKey: ["horizon", "network", HORIZON_URL],
    queryFn: async () => {
      return await fetchStellarApi(`${HORIZON_URL}/`, undefined, {
        notFoundMessage: "Network information could not be retrieved.",
      });
    },
    staleTime: Infinity, // no need to refetch unless redeployed
    gcTime: Infinity,
    enabled: Boolean(HORIZON_URL),
  });

  return query;
};
