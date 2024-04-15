import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/envVariables";
import { getSdpTenantName } from "helpers/getSdpTenantName";
import { UserRole } from "types";

export const patchUserRole = async (
  token: string,
  userId: string,
  role: UserRole,
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/users/roles`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "SDP-Tenant-Name": getSdpTenantName(),
    },
    body: JSON.stringify({
      user_id: userId,
      roles: [role],
    }),
  });

  return handleApiResponse(response);
};
