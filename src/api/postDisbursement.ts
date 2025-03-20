import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/envVariables";
import { getSdpTenantName } from "helpers/getSdpTenantName";
import { ApiDisbursement, Disbursement } from "types";

export const postDisbursement = async (
  token: string,
  disbursement: Disbursement,
): Promise<ApiDisbursement> => {
  const response = await fetch(`${API_URL}/disbursements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "SDP-Tenant-Name": getSdpTenantName(),
    },
    body: JSON.stringify(preparePostDisbursementData(disbursement)),
  });

  return handleApiResponse(response);
};

export const preparePostDisbursementData = (disbursement: Disbursement) => ({
  name: disbursement.name,
  wallet_id: disbursement.wallet.id,
  asset_id: disbursement.asset.id,
  registration_contact_type: disbursement.registrationContactType,
  verification_field: disbursement.verificationField || "",
  receiver_registration_message_template:
    disbursement.receiverRegistrationMessageTemplate,
});
