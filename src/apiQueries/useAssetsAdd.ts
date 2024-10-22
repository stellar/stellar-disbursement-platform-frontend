import { useMutation } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { ApiAsset, AppError } from "types";

type Asset = {
  assetCode: string;
  assetIssuer: string;
};

export const useAssetsAdd = ({
  onSuccess,
}: {
  onSuccess: (addedAsset: ApiAsset) => void;
}) => {
  const mutation = useMutation({
    mutationFn: ({ assetCode, assetIssuer }: Asset) => {
      return fetchApi(`${API_URL}/assets`, {
        method: "POST",
        body: JSON.stringify({
          code: assetCode,
          issuer: assetIssuer,
        }),
      });
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
