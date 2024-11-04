import { useQuery } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { RegistrationContactType, AppError } from "types";

export const useRegistrationContactTypes = () => {
  const query = useQuery<RegistrationContactType[], AppError>({
    queryKey: ["registrationContactTypes"],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/registration-contact-types`);
    },
    // Keeping the fetched data for longer since it won't change that often
    staleTime: 5 * 60 * 1000,
  });

  return query;
};
