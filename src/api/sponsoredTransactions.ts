import { API_URL } from "@/constants/envVariables";
import { fetchWalletApi } from "@/helpers/fetchWalletApi";

const SPONSORED_TRANSACTION_POLL_INTERVAL_MS = 2000;
const SPONSORED_TRANSACTION_MAX_ATTEMPTS = 120;

export interface CreateSponsoredTransactionRequest {
  operation_xdr: string;
}

export interface CreateSponsoredTransactionResponse {
  id: string;
  status: string;
}

export interface SponsoredTransactionStatusResponse {
  status: string;
  transaction_hash?: string;
}

export const createSponsoredTransaction = async (
  request: CreateSponsoredTransactionRequest,
): Promise<CreateSponsoredTransactionResponse> => {
  return fetchWalletApi<CreateSponsoredTransactionResponse>(
    `${API_URL}/embedded-wallets/sponsored-transactions`,
    {
      method: "POST",
      body: JSON.stringify(request),
    },
  );
};

export const getSponsoredTransactionStatus = async (
  transactionId: string,
): Promise<SponsoredTransactionStatusResponse> => {
  return fetchWalletApi<SponsoredTransactionStatusResponse>(
    `${API_URL}/embedded-wallets/sponsored-transactions/${encodeURIComponent(transactionId)}`,
    {
      method: "GET",
    },
  );
};

export const pollSponsoredTransactionStatus = async (
  transactionId: string,
  {
    intervalMs = SPONSORED_TRANSACTION_POLL_INTERVAL_MS,
    maxAttempts = SPONSORED_TRANSACTION_MAX_ATTEMPTS,
  }: {
    intervalMs?: number;
    maxAttempts?: number;
  } = {},
): Promise<SponsoredTransactionStatusResponse> => {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const status = await getSponsoredTransactionStatus(transactionId);

    if (status.status === "SUCCESS" || status.status === "FAILED") {
      return status;
    }

    await new Promise<void>((resolve) => {
      const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
        clearTimeout(timeoutId);
        resolve();
      }, intervalMs);
    });
  }

  throw new Error(`Timed out waiting for sponsored transaction ${transactionId} to complete`);
};
