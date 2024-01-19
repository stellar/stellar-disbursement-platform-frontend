import { useQuery } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { AppError } from "types";

export const useReceiverWalletInviteSmsRetry = (
  receiverWalletId: string | undefined,
) => {
  const query = useQuery<{ message: string }, AppError>({
    queryKey: ["receivers", "wallets", "sms", "retry", receiverWalletId],
    queryFn: async () => {
      return await fetchApi(
        `${API_URL}/receivers/wallets/${receiverWalletId}`,
        {
          method: "PATCH",
        },
      );
    },
    // Don't fire the query on mount
    enabled: false,
  });

  return query;
};
