import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/envVariables";
import { getSdpTenantName } from "helpers/getSdpTenantName";
import { ApiDisbursement, Disbursement } from "types";

export const postDisbursementWithInstructions = async (
  token: string,
  disbursement: Disbursement,
  file: File,
): Promise<ApiDisbursement> => {
  const formData = new FormData();

  const data = {
    name: disbursement.name,
    wallet_id: disbursement.wallet.id,
    asset_id: disbursement.asset.id,
    registration_contact_type: disbursement.registrationContactType,
    verification_field: disbursement.verificationField || "",
    receiver_registration_message_template:
      disbursement.receiverRegistrationMessageTemplate,
  };

  formData.append("data", JSON.stringify(data));
  formData.append("file", file);

  const response = await fetch(`${API_URL}/disbursements`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "SDP-Tenant-Name": getSdpTenantName(),
    },
    body: formData,
  });

  return handleApiResponse(response);
};
