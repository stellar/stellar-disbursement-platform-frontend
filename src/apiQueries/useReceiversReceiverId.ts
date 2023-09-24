import { useQuery } from "@tanstack/react-query";
import { API_URL } from "constants/settings";
import { fetchApi } from "helpers/fetchApi";
import { ApiReceiver, AppError } from "types";

export const useReceiversReceiverId = (receiverId: string | undefined) => {
  const query = useQuery<ApiReceiver, AppError>({
    queryKey: ["receivers", receiverId],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/receivers/${receiverId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    enabled: !!receiverId,
  });

  return query;
};
