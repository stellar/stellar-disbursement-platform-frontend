import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/constants/envVariables";
import { fetchApi } from "@/helpers/fetchApi";
import { formatPaymentReceiver } from "@/helpers/formatPaymentReceiver";
import { formatReceiver } from "@/helpers/formatReceiver";
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
  const query = useQuery<ApiReceiver | ReceiverDetails | PaymentDetailsReceiver, AppError>({
    queryKey: ["receivers", dataFormat, receiverId, { receiverWalletId }],
    queryFn: async () => {
      const response = await fetchApi(`${API_URL}/receivers/${receiverId}`);
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
