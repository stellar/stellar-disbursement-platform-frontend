import { ApiReceiver, ReceiverDetails } from "types";

export const formatReceiver = (receiver: ApiReceiver): ReceiverDetails => ({
  id: receiver.id,
  phoneNumber: receiver.phone_number,
  email: receiver.email,
  orgId: receiver.external_id,
  // TODO: how to handle multiple
  assetCode: receiver.received_amounts?.[0]?.asset_code,
  totalReceived: receiver.received_amounts?.[0]?.received_amount,
  stats: {
    paymentsTotalCount: Number(receiver.total_payments),
    paymentsSuccessfulCount: Number(receiver.successful_payments),
    paymentsFailedCount: Number(receiver.failed_payments),
    paymentsCanceledCount: Number(receiver.canceled_payments),
    paymentsRemainingCount: Number(receiver.remaining_payments),
  },
  wallets: receiver.wallets.map((w) => ({
    id: w.id,
    stellarAddress: w.stellar_address,
    stellarAddressMemo: w.stellar_memo,
    provider: w.wallet.name,
    invitedAt: w.invited_at,
    createdAt: w.created_at,
    smsLastSentAt: w.last_sms_sent,
    totalPaymentsCount: Number(w.payments_received),
    // TODO: how to handle multiple
    assetCode: w.received_amounts?.[0]?.asset_code,
    totalAmountReceived: w.received_amounts?.[0]?.received_amount,
  })),
  verifications:
    receiver.verifications?.map((v) => ({
      verificationField: v.verification_field,
      value: v.hashed_value,
      confirmedAt: v.confirmed_at,
    })) || [],
});
