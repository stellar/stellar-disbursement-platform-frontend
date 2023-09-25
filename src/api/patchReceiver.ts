import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/settings";
import { sanitizeObject } from "helpers/sanitizeObject";

export const patchReceiverInfo = async (
  token: string,
  receiverId: string,
  fields: {
    email: string;
    externalId: string;
  },
): Promise<{ message: string }> => {
  const fieldsToSubmit = sanitizeObject({
    email: fields.email,
    external_id: fields.externalId,
  });

  if (Object.keys(fieldsToSubmit).length === 0) {
    throw Error("Update receiver info requires at least one field to submit");
  }

  const response = await fetch(`${API_URL}/receivers/${receiverId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(fieldsToSubmit),
  });

  return handleApiResponse(response);
};
