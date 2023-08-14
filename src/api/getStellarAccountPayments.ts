import { HORIZON_URL } from "constants/settings";
import { shortenAccountKey } from "helpers/shortenAccountKey";
import { ApiStellarOperationRecord, ApiStellarPaymentType } from "types";

export const getStellarAccountPayments = async (
  stellarAddress: string,
): Promise<ApiStellarOperationRecord[]> => {
  // TODO: make params dynamic
  const response = await fetch(
    `${HORIZON_URL}/accounts/${stellarAddress}/operations?limit=20&order=desc`,
    {
      method: "GET",
    },
  );

  if (response.status === 404) {
    throw `${shortenAccountKey(stellarAddress)} address was not found.`;
  }

  const ACCEPTED_TYPE: ApiStellarPaymentType[] = [
    "payment",
    "path_payment_strict_send",
    "path_payment_strict_receive",
  ];

  const responseJson = await response.json();
  const { records } = responseJson._embedded;

  return records.filter((r: ApiStellarOperationRecord) =>
    ACCEPTED_TYPE.includes(r.type),
  );
};
