import { ApiDisbursement, Disbursement } from "types";

export const formatDisbursements = (
  disbursements: ApiDisbursement[],
): Disbursement[] => {
  return disbursements.map((d) => formatDisbursement(d));
};

export const formatDisbursement = (
  disbursement: ApiDisbursement,
): Disbursement => ({
  id: disbursement.id,
  name: disbursement.name,
  createdAt: disbursement.created_at,
  createdBy:
    disbursement.created_by?.first_name && disbursement.created_by?.last_name
      ? `${disbursement.created_by?.first_name} ${disbursement.created_by?.last_name}`
      : undefined,
  startedBy:
    disbursement.started_by?.first_name && disbursement.started_by?.last_name
      ? `${disbursement.started_by?.first_name} ${disbursement.started_by?.last_name}`
      : undefined,
  stats: {
    paymentsSuccessfulCount: disbursement.total_payments_sent,
    paymentsFailedCount: disbursement.total_payments_failed,
    paymentsCanceledCount: disbursement.total_payments_canceled,
    paymentsRemainingCount: disbursement.total_payments_remaining,
    paymentsTotalCount: disbursement.total_payments,
    totalAmount: disbursement.total_amount,
    disbursedAmount: disbursement.amount_disbursed,
    averagePaymentAmount: disbursement.average_amount,
  },
  status: disbursement.status,
  country: {
    name: disbursement.country.name,
    code: disbursement.country.code,
  },
  asset: {
    id: disbursement.asset.id,
    code: disbursement.asset.code,
  },
  wallet: {
    id: disbursement.wallet.id,
    name: disbursement.wallet.name,
  },
  verificationField: disbursement.verification_field,
  fileName: disbursement.file_name,
  statusHistory: disbursement.status_history
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .map((h) => ({
      status: h.status,
      timestamp: h.timestamp,
      userId: h.user_id,
    })),
  smsRegistrationMessageTemplate: disbursement.sms_registration_message_template,
});
