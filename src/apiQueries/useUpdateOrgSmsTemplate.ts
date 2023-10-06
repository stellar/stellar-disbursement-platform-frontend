import { useQuery } from "@tanstack/react-query";
import { API_URL } from "constants/settings";
import { fetchApi } from "helpers/fetchApi";
import { AppError } from "types";

export const useUpdateSmsTemplate = (template: string) => {
  const query = useQuery<{ message: string }, AppError>({
    queryKey: ["organization", "smsRegistrationMessageTemplate"],
    queryFn: async () => {
      const formData = new FormData();

      formData.append(
        "data",
        `{"sms_registration_message_template": "${template}"}`,
      );

      return await fetchApi(
        `${API_URL}/organization`,
        {
          method: "PATCH",
          body: formData,
        },
        { omitContentType: true },
      );
    },
    // Don't fire the query on mount
    enabled: false,
  });

  return query;
};
