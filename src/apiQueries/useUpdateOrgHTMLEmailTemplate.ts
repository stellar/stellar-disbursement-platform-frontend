import { useMutation } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { AppError } from "types";

export const useUpdateOrgHTMLEmailTemplate = () => {
  const mutation = useMutation({
    mutationFn: ({ template, subject }: { template: string; subject?: string }) => {
      const formData = new FormData();

      formData.append(
        "data",
        JSON.stringify({
          receiver_registration_html_email_template: template,
          receiver_registration_html_email_subject: subject || "",
        }),
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
