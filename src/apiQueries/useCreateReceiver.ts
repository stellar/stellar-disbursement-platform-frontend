import { API_URL } from "@/constants/envVariables";
import { fetchApi } from "@/helpers/fetchApi";
import { ApiReceiver, AppError, CreateReceiverRequest } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const useCreateReceiver = ({
  onSuccess,
}: {
  onSuccess: (receiver: ApiReceiver) => void;
}) => {
  const mutation = useMutation({
    mutationFn: (receiverData: CreateReceiverRequest) => {
      return fetchApi(`${API_URL}/receivers`, {
        method: "POST",
        body: JSON.stringify(receiverData),
      });
    },
    onSuccess,
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as ApiReceiver,
    mutateAsync: async (receiverData: CreateReceiverRequest) => {
      try {
        await mutation.mutateAsync(receiverData);
      } catch {
        // do nothing
      }
    },
  };
};
