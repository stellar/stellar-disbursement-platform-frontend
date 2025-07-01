import { useQuery } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { AppError, BridgeIntegration } from "types";

export const useBridgeIntegration = () => {
  return useQuery<
    BridgeIntegration | { status: "NOT_ENABLED" | "NOT_OPTED_IN" },
    AppError
  >({
    queryKey: ["bridge-integration"],
    queryFn: async () => {
      const result = await fetchApi(`${API_URL}/bridge-integration`);
      if (result === undefined) {
        return { status: "NOT_ENABLED" as const };
      }
      return result;
    },
  });
};
