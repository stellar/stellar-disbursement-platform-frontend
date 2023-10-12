import { useMutation } from "@tanstack/react-query";
import { API_URL } from "constants/settings";
import { fetchApi } from "helpers/fetchApi";
import { sanitizeObject } from "helpers/sanitizeObject";
import { AppError } from "types";

export const useUpdateReceiverDetails = (receiverId: string | undefined) => {
  const mutation = useMutation({
    mutationFn: (fields: { email: string; externalId: string }) => {
      const fieldsToSubmit = sanitizeObject({
        email: fields.email,
        external_id: fields.externalId,
      });

      if (Object.keys(fieldsToSubmit).length === 0) {
        return new Promise((_, reject) =>
          reject({
            message:
              "Update receiver info requires at least one field to submit",
          }),
        );
      }

      return fetchApi(
        `${API_URL}/receivers/${receiverId}`,
        {
          method: "PATCH",
          body: JSON.stringify(fieldsToSubmit),
        },
        { omitContentType: true },
      );
    },
    cacheTime: 0,
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as { message: string },
  };
};
