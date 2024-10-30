import { useMutation } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { ApiAsset, AppError } from "types";

export const useAssetsDelete = ({
  onSuccess,
}: {
  onSuccess: (deletedAsset: ApiAsset) => void;
}) => {
  const mutation = useMutation({
    mutationFn: (assetId: string) => {
      return fetchApi(`${API_URL}/assets/${assetId}`, {
        method: "DELETE",
      });
    },
    onSuccess,
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
