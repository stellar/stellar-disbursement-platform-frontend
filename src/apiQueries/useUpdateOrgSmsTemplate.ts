import { useMutation } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { AppError } from "types";

export const useUpdateSmsTemplate = () => {
  const mutation = useMutation({
    mutationFn: (template: string) => {
      const formData = new FormData();

      formData.append(
        "data",
        `{"receiver_registration_message_template": "${template}"}`,
      );

      return fetchApi(
        `${API_URL}/organization`,
        {
          method: "PATCH",
          body: formData,
        },
        { omitContentType: true },
      );
    },
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as { message: string },
  };
};
