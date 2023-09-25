import { ApiReceiver, PaymentDetailsReceiver } from "types";

export const formatPaymentReceiver = (
  receiver: ApiReceiver,
  receiverWalletId: string | undefined,
): PaymentDetailsReceiver => {
  const paymentWallet = receiverWalletId
    ? receiver.wallets.find((w) => w.id === receiverWalletId)
    : undefined;

  return {
    id: receiver.id,
    phoneNumber: receiver.phone_number,
    walletAddress: paymentWallet?.stellar_address || "",
    provider: paymentWallet?.wallet.name || "",
    totalPaymentsCount: Number(receiver.total_payments),
    successfulPaymentsCount: Number(receiver.successful_payments),
    createdAt: paymentWallet?.created_at || "",
    amountsReceived: receiver.received_amounts?.map((a) => ({
      amount: a.received_amount,
      assetCode: a.asset_code,
      assetIssuer: a.asset_issuer,
    })),
    status: paymentWallet?.status,
  };
};
