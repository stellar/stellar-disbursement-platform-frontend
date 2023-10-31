import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/settings";
import { getSdpTenantName } from "helpers/getSdpTenantName";
import { sanitizeObject } from "helpers/sanitizeObject";
import { OrgUpdateInfo } from "types";

export const patchOrgInfo = async (
  token: string,
  fields: OrgUpdateInfo,
): Promise<{ message: string }> => {
  const fieldsToSubmit = sanitizeObject(fields);

  if (Object.keys(fieldsToSubmit).length === 0) {
    throw Error(
      "Update organization info requires at least one field to submit",
    );
  }

  const formData = new FormData();

  Object.entries(fieldsToSubmit).forEach(([key, value]) => {
    switch (key) {
      case "name":
        formData.append("data", `{"organization_name": "${value}"}`);
        break;
      case "timezone":
        formData.append("data", `{"timezone_utc_offset": "${value}"}`);
        break;
      case "logo":
        formData.append("logo", value as Blob);
        break;
      case "isApprovalRequired":
        formData.append("data", `{"is_approval_required": ${value}}`);
        break;
      default:
        throw Error(`Update organization does not accept ${key} field`);
    }
  });

  // BE always expects data object
  if (!formData.get("data")) {
    formData.append("data", "{}");
  }

  const response = await fetch(`${API_URL}/organization`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      SDP_TENANT_NAME: getSdpTenantName(),
    },
    body: formData,
  });

  return handleApiResponse(response);
};
