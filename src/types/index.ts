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
    receiverInvitationResendInterval: number;
    receiverRegistrationMessageTemplate?: string;
    isLinkShortenerEnabled: boolean;
    isMemoTracingEnabled: boolean;
    baseUrl: string;
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
  apiKeys: ApiKeysInitialState;
  apiKeyDetails: ApiKeyDetailsInitialState;
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

export type AccountBalanceItem = {
  balance: string;
  assetCode: string;
  assetIssuer: string;
};

export type StellarAccountInfo = {
  address: string;
  balances: AccountBalanceItem[];
};

export type Export = "disbursements" | "receivers" | "payments";

// =============================================================================
// User
// =============================================================================
export type JwtUser = {
  id: string;
  email: string;
  roles: UserRole[] | null;
};

export type UserRole = "owner" | "financial_controller" | "developer" | "business";

export type NewUser = {
  first_name: string;
  last_name: string;
  role: UserRole;
  email: string;
};

// =============================================================================
// Distribution account
// =============================================================================
export type DistributionAccountStatus = "ACTIVE" | "PENDING_USER_ACTIVATION";
export type DistributionAccountType =
  | "DISTRIBUTION_ACCOUNT.STELLAR.ENV"
  | "DISTRIBUTION_ACCOUNT.STELLAR.DB_VAULT"
  | "DISTRIBUTION_ACCOUNT.CIRCLE.DB_VAULT";

// =============================================================================
// Disbursement
// =============================================================================
export type DisbursementStatusType = "DRAFT" | "READY" | "STARTED" | "PAUSED" | "COMPLETED";

export type DisbursementVerificationField =
  | "DATE_OF_BIRTH"
  | "YEAR_MONTH"
  | "PIN"
  | "NATIONAL_ID_NUMBER";

export const VerificationFieldMap: Record<DisbursementVerificationField | string, string> = {
  DATE_OF_BIRTH: "Date of Birth",
  YEAR_MONTH: "Date of Birth (Year & Month only)",
  PIN: "PIN",
  NATIONAL_ID_NUMBER: "National ID Number",
};

export type DisbursementDraftAction = "save" | "submit" | "delete";

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
  registrationContactType?: RegistrationContactType;
  asset: {
    id: string;
    code: string;
  };
  wallet: {
    id: string;
    name: string;
  };
  verificationField?: string;
  status: DisbursementStatusType;
  fileName?: string;
  statusHistory: {
    status: DisbursementStatusType;
    timestamp: string;
    userId: string | null;
  }[];
  receiverRegistrationMessageTemplate: string;
};

export type DisbursementsSearchParams = CommonFilters & SortParams & PaginationParams;

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
  phoneNumber?: string;
  email?: string;
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
  phoneNumber?: string;
  email?: string;
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
  circleTransferRequestId?: string;
};

// =============================================================================
// Receiver
// =============================================================================
export type ReceiverStatus = "DRAFT" | "READY" | "REGISTERED" | "FLAGGED";

export type ReceiversSearchParams = CommonFilters & SortParams & PaginationParams;

export type AmountReceived = {
  assetCode: string;
  assetIssuer: string;
  amount: string;
};

export type Receiver = {
  id: string;
  phoneNumber?: string;
  email?: string;
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
  stellarAddressMemo?: string;
  provider: string;
  invitedAt: string;
  createdAt: string;
  smsLastSentAt: string;
  totalPaymentsCount: number;
  totalAmountReceived: string;
  assetCode?: string;
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
  phoneNumber?: string;
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
  phoneNumber: string;
  externalId: string;
  yearMonth: string;
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
  paymentsDraftCount: number;
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
  receiverRegistrationMessageTemplate?: string;
};

// =============================================================================
// API response
// =============================================================================
export type ApiError = {
  error?: string;
  extras?: AnyObject;
};

export type RegistrationContactType =
  | "EMAIL"
  | "EMAIL_AND_WALLET_ADDRESS"
  | "PHONE_NUMBER"
  | "PHONE_NUMBER_AND_WALLET_ADDRESS";

export const RegistrationContactTypeMap: Record<RegistrationContactType | string, string> = {
  EMAIL: "Email",
  EMAIL_AND_WALLET_ADDRESS: "Wallet Address and Email",
  PHONE_NUMBER: "Phone Number",
  PHONE_NUMBER_AND_WALLET_ADDRESS: "Wallet Address and Phone Number",
};

export const hasWallet = (rct: RegistrationContactType | undefined): boolean =>
  Boolean(rct?.includes("WALLET_ADDRESS"));

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
  user_managed?: boolean;
};

export const isUserManagedWalletEnabled = (wallets: ApiWallet[] | undefined): boolean => {
  if (!wallets) {
    return false;
  }

  return wallets.some((w) => Boolean(w.user_managed) && w.enabled);
};

export type ApiDisbursements = {
  data: ApiDisbursement[];
  pagination: Pagination;
};

export type ApiDisbursementUser = {
  id: string;
  name: string;
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
  status: DisbursementStatusType;
  timestamp: string;
};

export type ApiDisbursement = {
  id: string;
  name: string;
  wallet: ApiDisbursementWallet;
  asset: ApiDisbursementAsset;
  status: DisbursementStatusType;
  verification_field?: DisbursementVerificationField;
  status_history: ApiDisbursementHistory[];
  receiver_registration_message_template: string;
  registration_contact_type: RegistrationContactType;
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
  status: DisbursementStatusType;
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
  type: "DISBURSEMENT" | "DIRECT";
  disbursement?: ApiPaymentDisbursement;
  asset: ApiPaymentAsset;
  receiver_wallet: ApiPaymentReceiverWallet;
  created_at: string;
  updated_at: string;
  external_payment_id?: string;
  circle_transfer_request_id?: string;
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
  phone_number?: string;
  email?: string;
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
  phone_number?: string;
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
  receiver_invitation_resend_interval_days: string;
  receiver_registration_message_template?: string;
  is_link_shortener_enabled: boolean;
  is_memo_tracing_enabled: boolean;
  base_url: string;
  payment_cancellation_period_days: string;
  distribution_account?: {
    address?: string;
    circle_wallet_id?: string;
    status: DistributionAccountStatus;
    type: DistributionAccountType;
  };
};

export type ApiStellarAccountBalance = {
  asset_code?: string;
  asset_issuer?: string;
  asset_type: string;
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

export interface ApiStellarOperationPathPaymentStrictSend extends ApiStellarOperationPathPayment {
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

export type ApiKey = {
  id: string;
  name: string;
  key?: string; // Only provided during creation
  expiry_date: string | null;
  permissions: string[];
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  last_used_at: string | null;
  allowed_ips: string[];
  enabled: boolean;
};

export type ApiKeysInitialState = {
  items: ApiKey[];
  status: ActionStatus | undefined;
  errorString?: string;
};

export type ApiKeysResponse = {
  data: ApiKey[];
};

export type CreateApiKeyRequest = {
  name: string;
  expiry_date?: string | null;
  permissions: string[];
  allowed_ips?: string[];
};

export type UpdateApiKeyRequest = {
  name?: string;
  expiry_date?: string | null;
  permissions?: string[];
  allowed_ips?: string[];
  enabled?: boolean;
};

export type ApiKeyDetailsInitialState = {
  details: ApiKey | null;
  status: ActionStatus | undefined;
  errorString?: string;
};

export type CreateDirectPaymentRequest = {
  amount: string;
  asset: DirectPaymentAsset;
  receiver: DirectPaymentReceiver;
  wallet?: DirectPaymentWallet;
  external_payment_id?: string;
};

export type DirectPaymentAsset = {
  id?: string;
  type?: "native" | "classic" | "contract" | "fiat";
  code?: string;
  issuer?: string;
  contract_id?: string;
};

export type DirectPaymentReceiver = {
  id?: string;
  email?: string;
  phone_number?: string;
  wallet_address?: string;
};

export type DirectPaymentWallet = {
  id?: string;
  address?: string;
};

export interface BridgeIntegration {
  status: BridgeIntegrationStatusType;
  customer_id: string;
  kyc_status: {
    id: string;
    type: "individual" | "business";
    kyc_status: BridgeKYCStatusType;
    tos_status: BridgeTOSStatusType;
    kyc_link: string;
    tos_link: string;
  };
  virtual_account?: {
    id: string;
    status: "activated" | "deactivated";
    source_deposit_instructions: {
      bank_beneficiary_name: string;
      currency: string;
      bank_name: string;
      bank_address: string;
      bank_account_number: string;
      bank_routing_number: string;
      payment_rails: string[];
    };
  };
}

export interface BridgeIntegrationUpdate {
  status: "OPTED_IN" | "READY_FOR_DEPOSIT";
  email?: string;
  full_name?: string;
  kyc_type?: "individual" | "business";
}

export type BridgeIntegrationStatusType =
  | "NOT_ENABLED"
  | "NOT_OPTED_IN"
  | "OPTED_IN"
  | "READY_FOR_DEPOSIT"
  | "ERROR";

export type BridgeKYCStatusType =
  | "not_started"
  | "incomplete"
  | "awaiting_ubo"
  | "under_review"
  | "approved"
  | "rejected"
  | "paused"
  | "offboarded";

export type BridgeTOSStatusType = "pending" | "approved";
