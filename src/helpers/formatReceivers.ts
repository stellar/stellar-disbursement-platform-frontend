import { ApiReceiver, Receiver } from "types";

export const formatReceivers = (receivers: ApiReceiver[]): Receiver[] => {
  return receivers.map((r) => ({
    id: r.id,
    phoneNumber: r.phone_number,
    email: r.email,
    walletProvider: r.wallets.map((w) => w.wallet.name),
    walletsRegisteredCount: Number(r.registered_wallets),
    totalPaymentsCount: Number(r.total_payments),
    successfulPaymentsCounts: Number(r.successful_payments),
    createdAt: r.created_at,
    amountsReceived: r.received_amounts?.map((a) => ({
      assetCode: a.asset_code,
      assetIssuer: a.asset_issuer,
      amount: a.received_amount,
    })),
  }));
};
