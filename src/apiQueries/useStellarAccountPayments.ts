import { useQuery } from "@tanstack/react-query";

import { HORIZON_URL } from "@/constants/envVariables";

import { getStellarTransaction } from "@/api/getStellarTransaction";

import { fetchStellarApi } from "@/helpers/fetchStellarApi";
import { shortenAccountKey } from "@/helpers/shortenAccountKey";

import {
  ApiStellarOperationInvokeHostFunction,
  ApiStellarOperationPayment,
  ApiStellarOperationRecord,
  AppError,
  ReceiverWalletPayment,
} from "@/types";

/** Minimum amount to filter out dust/spam transactions */
const MIN_PAYMENT_AMOUNT = 0.001;

/** Default number of payments to return */
export const DEFAULT_PAYMENT_LIMIT = 10;

/**
 * Normalized payment data extracted from different Horizon operation types.
 * This abstracts away the differences between classic payments and SAC transfers.
 */
interface NormalizedPaymentData {
  amount: string;
  from: string;
  to: string;
  assetCode: string;
  assetIssuer: string;
}

/** Type guard for SAC transfers */
const isInvokeHostFunction = (
  record: ApiStellarOperationRecord,
): record is ApiStellarOperationInvokeHostFunction => {
  return record.type === "invoke_host_function";
};

/**
 * Extracts payment data from a Horizon operation record.
 * Handles both classic payments and SAC transfers (invoke_host_function).
 * Returns null if the record doesn't contain valid payment data.
 */
const extractPaymentData = (
  record: ApiStellarOperationRecord,
  walletAddress?: string,
): NormalizedPaymentData | null => {
  // SAC transfers use invoke_host_function with asset_balance_changes
  if (isInvokeHostFunction(record)) {
    const balanceChanges = record.asset_balance_changes;

    if (!balanceChanges || balanceChanges.length === 0) {
      return null;
    }

    // If walletAddress is provided, try to find the change that involves the user.
    // Otherwise, default to the first change.
    let change = balanceChanges[0];
    if (walletAddress) {
      const userChange = balanceChanges.find(
        (c) => c.from === walletAddress || c.to === walletAddress,
      );
      if (userChange) {
        change = userChange;
      }
    }

    return {
      amount: change.amount,
      from: change.from,
      to: change.to,
      assetCode: change.asset_type === "native" ? "XLM" : change.asset_code || "",
      assetIssuer: change.asset_type === "native" ? "" : change.asset_issuer || "",
    };
  }

  // Classic payments (payment, path_payment_strict_send, path_payment_strict_receive)
  // We check for the existence of required fields to ensure it's a valid payment operation
  const classicOp = record as ApiStellarOperationPayment;
  if (!classicOp.amount || !classicOp.from || !classicOp.to) {
    return null;
  }

  return {
    amount: classicOp.amount,
    from: classicOp.from,
    to: classicOp.to,
    assetCode: classicOp.asset_code || "",
    assetIssuer: classicOp.asset_issuer || "",
  };
};

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

      const payments = await Promise.all(
        records
          // 1. Extract data first (Map)
          .map((record: ApiStellarOperationRecord) => ({
            record,
            paymentData: extractPaymentData(record, stellarAddress),
          }))
          // 2. Filter invalid or dust payments
          .filter(
            (item: {
              record: ApiStellarOperationRecord;
              paymentData: NormalizedPaymentData | null;
            }) => item.paymentData && parseFloat(item.paymentData.amount) >= MIN_PAYMENT_AMOUNT,
          )
          // 3. Limit to the requested number
          .slice(0, limit)
          // 4. Format final output (Async Map)
          .map(
            ({
              record,
              paymentData,
            }: {
              record: ApiStellarOperationRecord;
              paymentData: NormalizedPaymentData | null;
            }) => formatWalletPayment(record, paymentData!, stellarAddress),
          ),
      );

      return payments;
    },
    enabled: Boolean(stellarAddress),
  });

  return query;
};

const formatWalletPayment = async (
  record: ApiStellarOperationRecord,
  paymentData: NormalizedPaymentData,
  walletAddress: string,
): Promise<ReceiverWalletPayment> => {
  const isSend = paymentData.from === walletAddress;

  // Getting transaction details to get the memo
  const transaction = await getStellarTransaction(record.transaction_hash);

  return {
    id: record.id.toString(),
    amount: paymentData.amount,
    paymentAddress: isSend ? paymentData.to : paymentData.from,
    createdAt: record.created_at,
    assetCode: paymentData.assetCode,
    assetIssuer: paymentData.assetIssuer,
    operationKind: isSend ? "send" : "receive",
    transactionHash: record.transaction_hash,
    memo: transaction.memo || "",
  };
};
