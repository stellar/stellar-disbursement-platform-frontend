import { handleSearchParams } from "./handleSearchParams";

interface GetTransactionStatusParams {
  transferServerUrl: string;
  transactionId: string;
  token: string;
}

export const getTransactionStatus = async ({
  transferServerUrl,
  transactionId,
  token,
}: GetTransactionStatusParams): Promise<string> => {
  const params = handleSearchParams({
    id: transactionId,
  });

  const response = await fetch(`${transferServerUrl}/transaction${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Unable to fetch transaction");
  }

  const json = await response.json();
  const status = json?.transaction?.status;
  if (!status) {
    throw new Error("Transaction status is missing");
  }

  return status.toLowerCase();
};
