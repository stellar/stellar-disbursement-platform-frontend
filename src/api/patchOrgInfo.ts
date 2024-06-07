import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/envVariables";
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
  let data = {};

  Object.entries(fieldsToSubmit).forEach(([key, value]) => {
    switch (key) {
      case "name":
        data = { ...data, organization_name: `${value}` };
        break;
      case "privacyPolicyLink":
        data = { ...data, privacy_policy_link: `${value}` };
        break;
      case "timezone":
        data = { ...data, timezone_utc_offset: `${value}` };
        break;
      case "isApprovalRequired":
        data = { ...data, is_approval_required: value };
        break;
      case "logo":
        formData.append("logo", value as Blob);
        break;
      default:
        throw Error(`Update organization does not accept ${key} field`);
    }
  });

  formData.append("data", `${JSON.stringify(data)}`);

  // BE always expects data object
  if (!formData.get("data")) {
    formData.append("data", "{}");
  }

  const response = await fetch(`${API_URL}/organization`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "SDP-Tenant-Name": getSdpTenantName(),
    },
    body: formData,
  });

  return handleApiResponse(response);
};
