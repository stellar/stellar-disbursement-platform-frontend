import { ApiPayment, PaymentDetails } from "types";

export const formatPaymentDetails = (payment: ApiPayment): PaymentDetails => {
  return {
    id: payment.id,
    createdAt: payment.created_at,
    disbursementName: payment.disbursement?.name || "Direct Payment",
    disbursementId: payment.disbursement?.id || "",
    receiverId: payment?.receiver_wallet?.receiver?.id,
    receiverWalletId: payment?.receiver_wallet?.id,
    transactionId: payment.stellar_transaction_id,
    senderAddress: payment.stellar_address,
    totalAmount: payment.amount,
    assetCode: payment.asset.code,
    externalPaymentId: payment?.external_payment_id,
    circleTransferRequestId: payment?.circle_transfer_request_id,
    status: payment.status,
    statusHistory: payment?.status_history
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .map((h) => {
        return {
          updatedAt: h.timestamp,
          message: h.status_message,
          status: h.status,
        };
      }),
  };
};
