/* eslint-disable camelcase */

// =============================================================================
// Store
// =============================================================================
export type ActionStatus = "PENDING" | "SUCCESS" | "ERROR";

export interface RejectMessage {
  errorString: string;
  errorExtras?: AnyObject;
}

export interface SingleSignOnError {
  error: string;
  error_description: string;
  error_uri: unknown;
  form: unknown;
  name: string;
  session_state: unknown;
  state: unknown;
  message: string;
  stack: string;
}

export type PartialSingleError = Partial<SingleSignOnError>;

export type UserAccountInitialState = {
  token: string;
  email: string;
  role: UserRole | null;
  isAuthenticated: boolean;
  needsMFA: boolean | null;
  isSessionExpired: boolean;
  isTokenRefresh: boolean;
  status: ActionStatus | undefined;
  errorString?: string;
  restoredPathname?: string;
};

export type DisbursementDraftsInitialState = {
  items: DisbursementDraft[];
  status: ActionStatus | undefined;
  newDraftId?: string;
  pagination?: Pagination;
  errorString?: string;
  errorExtras?: AnyObject;
  actionType?: DisbursementDraftAction;
  isCsvFileUpdated?: boolean;
};

export type DisbursementsInitialState = {
  items: Disbursement[];
  status: ActionStatus | undefined;
  pagination?: Pagination;
  errorString?: string;
  searchParams?: DisbursementsSearchParams;
};

export type DisbursementDetailsInitialState = {
  details: Disbursement;
  instructions: DisbursementInstructions;
  status: ActionStatus | undefined;
  errorString?: string;
};

export type OrganizationInitialState = {
  data: {
    name: string;
    privacyPolicyLink: string;
    logo: string;
    distributionAccountPublicKey: string;
    timezoneUtcOffset: string;
    isApprovalRequired: boolean | undefined;
    smsResendInterval: number;
    smsRegistrationMessageTemplate?: string;
    paymentCancellationPeriodDays: number;
    distributionAccount?: {
      circleWalletId?: string;
      status: string;
      type: string;
    };
  };
  updateMessage?: string;
  status: ActionStatus | undefined;
  errorString?: string;
  errorExtras?: AnyObject;
};

export type ProfileInitialState = {
  data: AccountProfile;
  updateMessage?: string;
  status: ActionStatus | undefined;
  errorString?: string;
  errorExtras?: AnyObject;
};

export interface Store {
  disbursementDetails: DisbursementDetailsInitialState;
  disbursementDrafts: DisbursementDraftsInitialState;
  disbursements: DisbursementsInitialState;
  organization: OrganizationInitialState;
  profile: ProfileInitialState;
  userAccount: UserAccountInitialState;
}

export type StoreKey = keyof Store;

// =============================================================================
// Generic
// =============================================================================
export type AnyObject = {
  [key: string]: any;
};

export interface AppError {
  message: string;
  extras?: AnyObject;
}

export type Pagination = {
  next?: string;
  prev?: string;
  pages: number;
  total?: number;
};

export type CommonFilters = {
  status?: string;
  created_at_after?: string;
  created_at_before?: string;
  q?: string;
};

export type SortParams = {
  sort?: SortByDisbursements | SortByReceivers | SortByPayments;
  direction?: SortDirection;
};

export type PaginationParams = {
  page?: string;
  page_limit?: string;
};

export type DisbursementStep = "edit" | "preview" | "confirmation";

export type SortDirection = "default" | "asc" | "desc";

export type SortByDisbursements = "name" | "created_at";

export type SortByReceivers = "created_at";

export type SortByPayments = "created_at";

export type StellarAccountBalance = {
  balance: string;
  assetCode: string;
  assetIssuer: string;
};

export type StellarAccountInfo = {
  address: string;
  balances: StellarAccountBalance[];
};

// =============================================================================
// User
// =============================================================================
export type JwtUser = {
  id: string;
  email: string;
  roles: UserRole[] | null;
};

export type UserRole =
  | "owner"
  | "financial_controller"
  | "developer"
  | "business";

export type NewUser = {
  first_name: string;
  last_name: string;
  role: UserRole;
  email: string;
};

// =============================================================================
// Disbursement
// =============================================================================
export type DisbursementStatus =
  | "DRAFT"
  | "READY"
  | "STARTED"
  | "PAUSED"
  | "COMPLETED";

export type DisbursementVerificationField =
  | "DATE_OF_BIRTH"
  | "PIN"
  | "NATIONAL_ID_NUMBER";

export type DisbursementDraftAction = "save" | "submit";

export interface DisbursementInstructions {
  csvName?: string;
  csvFile?: File;
}

export interface DisbursementDraft {
  details: Disbursement;
  instructions: DisbursementInstructions;
}

export type Disbursement = {
  id: string;
  name: string;
  createdAt: string;
  createdBy?: string;
  startedBy?: string;
  stats?: DisbursementDetailsStats;
  receivers?: {
    items: DisbursementReceiver[];
    pagination?: Pagination;
    searchParams?: ReceiversSearchParams;
  };
  country: {
    name: string;
    code: string;
  };
  asset: {
    id: string;
    code: string;
  };
  wallet: {
    id: string;
    name: string;
  };
  verificationField?: string;
  status: DisbursementStatus;
  fileName?: string;
  statusHistory: {
    status: DisbursementStatus;
    timestamp: string;
    userId: string | null;
  }[];
  smsRegistrationMessageTemplate: string;
};

export type DisbursementsSearchParams = CommonFilters &
  SortParams &
  PaginationParams;

export interface DisbursementDraftRejectMessage extends RejectMessage {
  newDraftId?: string;
}

export type DisbursementDetailsStats = {
  paymentsSuccessfulCount: number;
  paymentsFailedCount: number;
  paymentsCanceledCount: number;
  paymentsRemainingCount: number;
  paymentsTotalCount: number;
  totalAmount: string;
  disbursedAmount: string;
  averagePaymentAmount: string;
};

export type DisbursementReceiver = {
  id: string;
  phoneNumber: string;
  provider: string;
  assetCode: string;
  amount: string;
  completedAt?: string;
  blockchainId: string;
  orgId: string;
  paymentStatus: PaymentStatus;
};

// =============================================================================
// Payment
// =============================================================================
export type PaymentStatus =
  | "DRAFT"
  | "READY"
  | "PENDING"
  | "PAUSED"
  | "SUCCESS"
  | "FAILED"
  | "CANCELED";

export type PaymentsSearchParams = CommonFilters &
  SortParams &
  PaginationParams & { receiver_id?: string };

export type PaymentDetailsStatusHistoryItem = {
  updatedAt: string;
  message?: string;
  status: PaymentStatus;
};

export type PaymentDetailsReceiver = {
  id: string;
  phoneNumber: string;
  walletAddress: string;
  provider: string;
  totalPaymentsCount: number;
  successfulPaymentsCount: number;
  createdAt: string;
  amountsReceived?: AmountReceived[];
  status: ReceiverStatus | undefined;
};

export type PaymentDetails = {
  id: string;
  createdAt: string;
  disbursementName: string;
  disbursementId: string;
  receiverId?: string;
  receiverWalletId?: string;
  transactionId?: string;
  senderAddress?: string;
  totalAmount: string;
  assetCode: string;
  status: PaymentStatus;
  statusHistory: PaymentDetailsStatusHistoryItem[];
  externalPaymentId?: string;
};

// =============================================================================
// Receiver
// =============================================================================
export type ReceiverStatus = "DRAFT" | "READY" | "REGISTERED" | "FLAGGED";

export type ReceiversSearchParams = CommonFilters &
  SortParams &
  PaginationParams;

export type AmountReceived = {
  assetCode: string;
  assetIssuer: string;
  amount: string;
};

export type Receiver = {
  id: string;
  phoneNumber: string;
  walletProvider: string[];
  walletsRegisteredCount: number;
  totalPaymentsCount: number;
  successfulPaymentsCounts: number;
  createdAt: string;
  amountsReceived?: AmountReceived[];
};

export type ReceiverWallet = {
  id: string;
  stellarAddress: string;
  provider: string;
  invitedAt: string;
  createdAt: string;
  smsLastSentAt: string;
  totalPaymentsCount: number;
  totalAmountReceived: string;
  withdrawnAmount: string;
  assetCode: string;
};

export type ReceiverVerification = {
  verificationField: string;
  value: string;
  confirmedAt?: string;
};

export type ReceiverWalletBalance = {
  assetCode: string;
  assetIssuer: string;
  balance: string;
};

export type PaymentOperationKind = "send" | "receive";

export type ReceiverWalletPayment = {
  id: string;
  createdAt: string;
  paymentAddress: string;
  amount: string;
  assetCode: string;
  assetIssuer: string;
  operationKind: PaymentOperationKind;
  transactionHash: string;
  memo: string;
};

export type ReceiverDetails = {
  id: string;
  phoneNumber: string;
  email?: string;
  assetCode?: string;
  totalReceived?: string;
  orgId: string;
  stats: {
    paymentsTotalCount: number;
    paymentsSuccessfulCount: number;
    paymentsFailedCount: number;
    paymentsCanceledCount: number;
    paymentsRemainingCount: number;
  };
  wallets: ReceiverWallet[];
  verifications: ReceiverVerification[];
};

export type ReceiverEditFields = {
  email: string;
  externalId: string;
  dateOfBirth: string;
  pin: string;
  nationalId: string;
};

// =============================================================================
// Statistics
// =============================================================================
export type HomeStatistics = {
  paymentsSuccessfulCounts: number;
  paymentsFailedCount: number;
  paymentsCanceledCount: number;
  paymentsRemainingCount: number;
  paymentsTotalCount: number;
  walletsTotalCount: number;
  individualsTotalCount: number;
  assets: {
    assetCode: string;
    success: string;
    average: string;
  }[];
};

// =============================================================================
// Profile
// =============================================================================
export type AccountProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole | null;
};

// =============================================================================
// Organization
// =============================================================================
export type OrgUpdateInfo = {
  name?: string;
  privacyPolicyLink?: string;
  timezone?: string;
  logo?: File;
  isApprovalRequired?: boolean;
  smsRegistrationMessageTemplate?: string;
};

// =============================================================================
// API response
// =============================================================================
export type ApiError = {
  error?: string;
  extras?: AnyObject;
};

export type ApiCountry = {
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type ApiAsset = {
  id: string;
  code: string;
  issuer: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
};

export type ApiWallet = {
  id: string;
  name: string;
  homepage: string;
  deep_link_schema: string;
  enabled: boolean;
  assets: ApiAsset[];
  created_at: string;
  updated_at: string;
};

export type ApiDisbursements = {
  data: ApiDisbursement[];
  pagination: Pagination;
};

export type ApiDisbursementUser = {
  id: string;
  name: string;
};

export type ApiDisbursementCountry = {
  code: string;
  name: string;
  language: string;
  created_at: string;
  updated_at: string;
};

export type ApiDisbursementWallet = {
  id: string;
  name: string;
  homepage: string;
  deep_link_schema?: string;
  created_at?: string;
  updated_at?: string;
};

export type ApiDisbursementAsset = {
  id: string;
  code: string;
  issuer: string;
  created_at?: string;
  updated_at?: string;
};

export type ApiDisbursementHistory = {
  user_id: string | null;
  status: DisbursementStatus;
  timestamp: string;
};

export type ApiDisbursement = {
  id: string;
  name: string;
  country: ApiDisbursementCountry;
  wallet: ApiDisbursementWallet;
  asset: ApiDisbursementAsset;
  status: DisbursementStatus;
  verification_field: DisbursementVerificationField;
  status_history: ApiDisbursementHistory[];
  sms_registration_message_template: string;
  created_at: string;
  updated_at: string;
  created_by?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  started_by?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  total_payments: number;
  total_payments_sent: number;
  total_payments_failed: number;
  total_payments_canceled: number;
  total_payments_remaining: number;
  amount_disbursed: string;
  total_amount: string;
  average_amount: string;
  file_name?: string;
};

export type ApiPaymentStatusHistory = {
  status: PaymentStatus;
  status_message: string;
  timestamp: string;
};

export type ApiPaymentDisbursement = {
  id: string;
  name: string;
  status: DisbursementStatus;
  created_at: string;
  updated_at: string;
};

export type ApiPaymentAsset = {
  id: string;
  code: string;
  issuer: string;
};

export type ApiPaymentReceiverWallet = {
  id: string;
  receiver: {
    id: string;
  };
  wallet: {
    id: string;
    name: string;
  };
  stellar_address?: string;
  stellar_memo?: string;
  stellar_memo_type?: string;
  status: ReceiverStatus;
  created_at: string;
  updated_at: string;
};

export type ApiPayment = {
  id: string;
  amount: string;
  stellar_transaction_id?: string;
  stellar_operation_id?: string;
  stellar_address?: string;
  status: PaymentStatus;
  status_history: ApiPaymentStatusHistory[];
  disbursement: ApiPaymentDisbursement;
  asset: ApiPaymentAsset;
  receiver_wallet: ApiPaymentReceiverWallet;
  created_at: string;
  updated_at: string;
  external_payment_id?: string;
};

export type ApiPayments = {
  data: ApiPayment[];
  pagination: Pagination;
};

export type ApiStatisticsAsset = {
  asset_code: string;
  payment_amounts: {
    canceled: number;
    draft: number;
    ready: number;
    pending: number;
    paused: number;
    success: number;
    failed: number;
    average: number;
    total: number;
  };
};

export type ApiStatistics = {
  payment_counters: {
    canceled: number;
    draft: number;
    ready: number;
    pending: number;
    paused: number;
    success: number;
    failed: number;
    total: number;
  };
  receiver_wallets_counters: {
    draft: number;
    ready: number;
    registered: number;
    flagged: number;
    total: number;
  };
  payment_amounts_by_asset: ApiStatisticsAsset[];
  total_disbursements: number;
  total_receivers: number;
};

export type ApiDisbursementReceiver = {
  id: string;
  phone_number: string;
  external_id: string;
  receiver_wallet: {
    id: string;
    receiver: {
      id: string;
    };
    wallet: {
      id: string;
      name: string;
    };
    status: ReceiverStatus;
    created_at: string;
    updated_at: string;
  };
  payment: {
    id: string;
    amount: string;
    stellar_transaction_id: string;
    stellar_operation_id: string;
    status: PaymentStatus;
    asset: ApiPaymentAsset;
    created_at: string;
    updated_at: string;
  };
  created_at: string;
  updated_at: string;
};

export type ApiDisbursementReceivers = {
  data: ApiDisbursementReceiver[];
  pagination: Pagination;
};

export type ApiReceiverWallet = {
  id: string;
  receiver: {
    id: string;
  };
  wallet: ApiDisbursementWallet;
  stellar_address: string;
  stellar_memo: string;
  stellar_memo_type: string;
  status: ReceiverStatus;
  created_at: string;
  updated_at: string;
  invited_at: string;
  last_sms_sent: string;
  total_payments: string | number;
  payments_received: string | number;
  failed_payments: string | number;
  remaining_payments: string | number;
  received_amounts: {
    asset_code: string;
    received_amount: string;
  }[];
};

export type ApiReceiverVerification = {
  verification_field: string;
  hashed_value: string;
  confirmed_at: string;
};

export type ApiReceiver = {
  created_at: string;
  id: string;
  phone_number: string;
  email?: string;
  external_id: string;
  total_payments: string | number;
  successful_payments: string | number;
  failed_payments: string | number;
  canceled_payments: string | number;
  remaining_payments: string | number;
  received_amounts?: {
    asset_code: string;
    asset_issuer: string;
    received_amount: string;
  }[];
  registered_wallets: string;
  wallets: ApiReceiverWallet[];
  verifications: ApiReceiverVerification[];
};

export type ApiReceivers = {
  data: ApiReceiver[];
  pagination: Pagination;
};

export type ApiProfileInfo = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: UserRole[] | null;
  organization_name: string;
};

export type ApiOrgInfo = {
  name: string;
  privacy_policy_link: string;
  logo_url: string;
  distribution_account_public_key: string;
  timezone_utc_offset: string;
  is_approval_required: boolean;
  sms_resend_interval: string;
  sms_registration_message_template?: string;
  payment_cancellation_period_days: string;
  distribution_account?: {
    circle_wallet_id?: string;
    status: string;
    type: string;
  };
};

export type ApiStellarAccountBalance = {
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
};

export type ApiStellarAccount = {
  id: string;
  balances: ApiStellarAccountBalance[];
};

export type ApiUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: UserRole[] | null;
  is_active: boolean;
};

export type ApiNewUser = {
  id: string;
  first_name: string;
  last_name: string;
  roles: UserRole[];
  email: string;
};

export type ApiStellarOperationRecord =
  | ApiStellarOperationPayment
  | ApiStellarOperationPathPaymentStrictReceive
  | ApiStellarOperationPathPaymentStrictSend;

export type ApiStellarPaymentType =
  | "payment"
  | "path_payment_strict_send"
  | "path_payment_strict_receive";

export interface ApiStellarOperationBase {
  id: number;
  paging_token: string;
  type_i: number;
  type: ApiStellarPaymentType;
  transaction_hash: string;
  transaction_successful: boolean;
  source_account: string;
  created_at: string;
}

export interface ApiStellarOperationPayment extends ApiStellarOperationBase {
  asset_type: string;
  asset_code: string;
  asset_issuer: string;
  from: string;
  to: string;
  amount: string;
}

export interface ApiStellarOperationPathPayment
  extends ApiStellarOperationBase,
    ApiStellarOperationPayment {
  path: {
    asset_type: string;
    asset_code: string;
    asset_issuer: string;
  }[];
  source_amount: string;
  source_asset_type: string;
  source_asset_code: string;
  source_asset_issuer: string;
}

export interface ApiStellarOperationPathPaymentStrictReceive
  extends ApiStellarOperationPathPayment {
  source_max: string;
}

export interface ApiStellarOperationPathPaymentStrictSend
  extends ApiStellarOperationPathPayment {
  destination_min: string;
}

export type ApiStellarTransaction = {
  id: string;
  paging_token: string;
  successful: boolean;
  hash: string;
  ledger: number;
  created_at: string;
  source_account: string;
  source_account_sequence: string;
  fee_charged: string;
  max_fee: string;
  operation_count: number;
  envelope_xdr: string;
  result_xdr: string;
  result_meta_xdr: string;
  fee_meta_xdr: string;
  memo: string;
  memo_type: string;
  signatures: string[];
  valid_after: string;
  valid_before: string;
};
