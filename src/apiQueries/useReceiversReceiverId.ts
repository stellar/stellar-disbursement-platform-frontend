import { useQuery } from "@tanstack/react-query";
import { API_URL } from "constants/settings";
import { fetchApi } from "helpers/fetchApi";
import { formatPaymentReceiver } from "helpers/formatPaymentReceiver";
import { formatReceiver } from "helpers/formatReceiver";
import { ApiReceiver, AppError } from "types";

export const useReceiversReceiverId = <T>({
  receiverId,
  dataFormat,
  receiverWalletId,
}: {
  receiverId: string | undefined;
  dataFormat: "receiver" | "paymentReceiver";
  receiverWalletId?: string;
}) => {
  const query = useQuery<ApiReceiver, AppError>({
    queryKey: ["receivers", dataFormat, receiverId, { receiverWalletId }],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/receivers/${receiverId}`);
    },
    enabled: !!receiverId,
  });

  const formatData = (data: ApiReceiver) => {
    return dataFormat === "receiver"
      ? formatReceiver(data)
      : formatPaymentReceiver(data, receiverWalletId);
  };

  return {
    ...query,
    data: query.data ? (formatData(query.data) as T) : undefined,
  };
};
