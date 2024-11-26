import { useMutation } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { sanitizeObject } from "helpers/sanitizeObject";
import { AppError } from "types";

interface ReceiverDetailsUpdate {
  email: string;
  phoneNumber: string;
  externalId: string;
  dataOfBirth: string;
  yearMonth: string;
  pin: string;
  nationalId: string;
}

export const useUpdateReceiverDetails = (receiverId: string | undefined) => {
  const mutation = useMutation({
    mutationFn: (fields: ReceiverDetailsUpdate) => {
      const fieldsToSubmit = sanitizeObject({
        email: fields.email,
        phone_number: fields.phoneNumber,
        external_id: fields.externalId,
        date_of_birth: fields.dataOfBirth,
        year_month: fields.yearMonth,
        pin: fields.pin,
        national_id: fields.nationalId,
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
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as { message: string },
  };
};
