import { useQuery } from "@tanstack/react-query";

import { getStellarTransaction } from "@/api/getStellarTransaction";
import { HORIZON_URL } from "@/constants/envVariables";
import { fetchStellarApi } from "@/helpers/fetchStellarApi";
import { shortenAccountKey } from "@/helpers/shortenAccountKey";
import { ApiStellarOperationRecord, AppError, ReceiverWalletPayment } from "@/types";

/** Minimum amount to filter out dust/spam transactions */
const MIN_PAYMENT_AMOUNT = 0.001;

/** Default number of payments to return */
export const DEFAULT_PAYMENT_LIMIT = 10;

export const useStellarAccountPayments = (
  stellarAddress: string | undefined,
  limit: number = DEFAULT_PAYMENT_LIMIT,
) => {
  // Fetch more records than needed to account for filtered dust transactions
  // Using 2x multiplier to offset records that will be filtered out as dust/spam
  const fetchLimit = Math.min(limit * 2, 200);

  const query = useQuery<ReceiverWalletPayment[], AppError>({
    queryKey: ["stellar", "accounts", "payments", stellarAddress, limit],
    queryFn: async () => {
      if (!stellarAddress) {
        return [];
      }

      const response = await fetchStellarApi(
        `${HORIZON_URL}/accounts/${stellarAddress}/payments?limit=${fetchLimit}&order=desc`,
        undefined,
        {
          notFoundMessage: `${shortenAccountKey(stellarAddress)} address was not found.`,
        },
      );

      const { records } = response._embedded;

      // Filter out dust/spam transactions below minimum amount
      const filteredRecords = records.filter(
        (r: ApiStellarOperationRecord) => parseFloat(r.amount) >= MIN_PAYMENT_AMOUNT,
      );

      // Take only the requested number of payments
      const limitedRecords = filteredRecords.slice(0, limit);

      const payments = [];

      for (const record of limitedRecords) {
        const payment = await formatWalletPayment(record, stellarAddress);
        payments.push(payment);
      }

      return payments;
    },
    enabled: Boolean(stellarAddress),
  });

  return query;
};

const formatWalletPayment = async (
  payment: ApiStellarOperationRecord,
  walletAddress: string,
): Promise<ReceiverWalletPayment> => {
  const isSend = payment.from === walletAddress;

  // Getting transaction details to get the memo
  const transaction = await getStellarTransaction(payment.transaction_hash);

  return {
    id: payment.id.toString(),
    amount: payment.amount,
    paymentAddress: isSend ? payment.to : payment.from,
    createdAt: payment.created_at,
    assetCode: payment.asset_code,
    assetIssuer: payment.asset_issuer,
    operationKind: isSend ? "send" : "receive",
    transactionHash: payment.transaction_hash,
    memo: transaction.memo || "",
  };
};
