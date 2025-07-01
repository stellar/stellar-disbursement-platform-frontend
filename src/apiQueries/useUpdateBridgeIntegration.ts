import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { AppError, BridgeIntegration, BridgeIntegrationUpdate } from "types";

export const useUpdateBridgeIntegration = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: BridgeIntegrationUpdate) => {
      return fetchApi(`${API_URL}/bridge-integration`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      // Invalidate and refetch bridge integration data
      queryClient.invalidateQueries({ queryKey: ["bridge-integration"] });
    },
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as BridgeIntegration,
    mutateAsync: async (data: BridgeIntegrationUpdate) => {
      return await mutation.mutateAsync(data);
    },
  };
};
