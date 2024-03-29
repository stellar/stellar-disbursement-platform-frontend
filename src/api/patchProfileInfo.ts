import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/envVariables";
import { getSdpTenantName } from "helpers/getSdpTenantName";
import { sanitizeObject } from "helpers/sanitizeObject";

export const patchProfileInfo = async (
  token: string,
  fields: {
    firstName?: string;
    lastName?: string;
    email?: string;
  },
): Promise<{ message: string }> => {
  const fieldsToSubmit = sanitizeObject({
    first_name: fields.firstName,
    last_name: fields.lastName,
    email: fields.email,
  });

  if (Object.keys(fieldsToSubmit).length === 0) {
    throw Error("Update profile info requires at least one field to submit");
  }

  const response = await fetch(`${API_URL}/profile`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "SDP-Tenant-Name": getSdpTenantName(),
    },
    body: JSON.stringify(fieldsToSubmit),
  });

  return handleApiResponse(response);
};
