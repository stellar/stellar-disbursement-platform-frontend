import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/settings";
import { sanitizeObject } from "helpers/sanitizeObject";

export const patchProfilePassword = async (
  token: string,
  fields: {
    currentPassword?: string;
    newPassword?: string;
  },
): Promise<{ message: string }> => {
  const fieldsToSubmit = sanitizeObject({
    current_password: fields.currentPassword,
    new_password: fields.newPassword,
  });

  if (Object.keys(fieldsToSubmit).length < 2) {
    throw Error(
      "Update profile password requires current password and new password.",
    );
  }

  const response = await fetch(`${API_URL}/profile/reset-password`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(fieldsToSubmit),
  });

  return handleApiResponse(response);
};
