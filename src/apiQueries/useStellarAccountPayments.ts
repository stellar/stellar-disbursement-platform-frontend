import { useQuery } from "@tanstack/react-query";
import { getStellarTransaction } from "api/getStellarTransaction";
import { HORIZON_URL } from "constants/envVariables";
import { fetchStellarApi } from "helpers/fetchStellarApi";
import { shortenAccountKey } from "helpers/shortenAccountKey";
import {
  ApiStellarOperationRecord,
  ApiStellarPaymentType,
  AppError,
  ReceiverWalletPayment,
} from "types";

const ACCEPTED_TYPE: ApiStellarPaymentType[] = [
  "payment",
  "path_payment_strict_send",
  "path_payment_strict_receive",
];

export const useStellarAccountPayments = (
  stellarAddress: string | undefined,
) => {
  const query = useQuery<ReceiverWalletPayment[], AppError>({
    queryKey: ["stellar", "accounts", "payments", stellarAddress],
    queryFn: async () => {
      if (!stellarAddress) {
        return [];
      }

      // TODO: make params dynamic
      const response = await fetchStellarApi(
        `${HORIZON_URL}/accounts/${stellarAddress}/operations?limit=20&order=desc`,
        undefined,
        {
          notFoundMessage: `${shortenAccountKey(
            stellarAddress,
          )} address was not found.`,
        },
      );

      const { records } = response._embedded;

      const paymentRecords = records.filter((r: ApiStellarOperationRecord) =>
        ACCEPTED_TYPE.includes(r.type),
      );

      const payments = [];

      for await (const record of paymentRecords) {
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
