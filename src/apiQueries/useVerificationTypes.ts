import { useQuery } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { DisbursementVerificationField, AppError } from "types";

export const useVerificationTypes = () => {
  const query = useQuery<DisbursementVerificationField[], AppError>({
    queryKey: ["receivers", "verification-types"],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/receivers/verification-types`);
    },
  });

  return query;
};
