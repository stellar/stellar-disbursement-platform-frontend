import { useQuery } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { fetchApi } from "@/helpers/fetchApi";
import { formatPaymentReceiver } from "@/helpers/formatPaymentReceiver";
import { formatReceiver } from "@/helpers/formatReceiver";
import { ALL_ACCOUNTS } from "@/helpers/localStorageSelectedWallet";

import { useSelectedWallet } from "@/hooks/useSelectedWallet";

import { ApiReceiver, AppError, PaymentDetailsReceiver, ReceiverDetails } from "@/types";

export const useReceiversReceiverId = <T>({
  receiverId,
  dataFormat,
  receiverWalletId,
}: {
  receiverId: string | undefined;
  dataFormat: "receiver" | "paymentReceiver" | "raw";
  receiverWalletId?: string;
}) => {
  const { selectedWalletId } = useSelectedWallet();
  // The response carries payment counters scoped to the selected account, so the cache entry is
  // keyed by the same account that produced its X-Wallet-Id header.
  const walletKey = selectedWalletId || ALL_ACCOUNTS;

  const query = useQuery<ApiReceiver | ReceiverDetails | PaymentDetailsReceiver, AppError>({
    queryKey: ["receivers", dataFormat, receiverId, { receiverWalletId, walletKey }],
    queryFn: async () => {
      const response = await fetchApi(`${API_URL}/receivers/${receiverId}`, undefined, {
        walletId: selectedWalletId || null,
      });
      if (dataFormat === "raw") {
        return response;
      }
      return dataFormat === "receiver"
        ? formatReceiver(response)
        : formatPaymentReceiver(response, receiverWalletId);
    },
    enabled: !!receiverId,
  });

  return {
    ...query,
    data: query.data as T,
  };
};
