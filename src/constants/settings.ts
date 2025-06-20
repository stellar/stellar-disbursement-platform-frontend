import { UserRole } from "types";

export const PROJECT_NAME = "stellarDisbursementPlatform";
export const LOCALE = "en-US";
export const RESET_STORE_ACTION_TYPE = "RESET";

export const GENERIC_ERROR_MESSAGE = "Something went wrong, please try again";
export const SESSION_EXPIRED = "SESSION EXPIRED";
export const SESSION_EXPIRED_EVENT = "sdp_session_expired_event";
export const LOCAL_STORAGE_SESSION_TOKEN = "sdp_session";
export const LOCAL_STORAGE_DEVICE_ID = "sdp_deviceID";
export const LOCAL_STORAGE_TENANT_NAME = "sdp_tenant_name";
export const UI_STATUS_DISBURSEMENT = "STARTED,PAUSED,COMPLETED";
export const UI_STATUS_DISBURSEMENT_DRAFT = "DRAFT,READY";
export const ORG_NAME_INFO_TEXT =
  "You can find your organization name in the invitation email";

export const CANCELED_PAYMENT_STATUS = "CANCELED";
export const READY_PAYMENT_STATUS = "READY";

export enum Routes {
  MFA = "/mfa",
  HOME = "/home",
  FORGOT_PASSWORD = "/forgot-password",
  RESET_PASSWORD = "/reset-password",
  SET_NEW_PASSWORD = "/set-password",
  DISBURSEMENTS = "/disbursements",
  DISBURSEMENT_NEW = "/disbursements/new",
  DISBURSEMENT_DRAFTS = "/disbursements/drafts",
  RECEIVERS = "/receivers",
  RECEIVERS_EDIT = "/receivers/edit",
  PAYMENTS = "/payments",
  DISTRIBUTION_ACCOUNT = "/distribution-account",
  WALLET_PROVIDERS = "/wallet-providers",
  ANALYTICS = "/analytics",
  PROFILE = "/profile",
  SETTINGS = "/settings",
  API_KEYS = "/api-keys",
  HELP = "/help",
  UNAUTHORIZED = "/unauthorized",
}

export const PAGE_LIMIT_OPTIONS = [20, 50, 100];
export const USER_ROLES_ARRAY: UserRole[] = [
  "owner",
  "financial_controller",
  "developer",
  "business",
];

export const TIME_ZONES = [
  {
    name: "GMT -12:00",
    value: "-12:00",
  },
  {
    name: "GMT -11:00",
    value: "-11:00",
  },
  {
    name: "GMT -10:00",
    value: "-10:00",
  },
  {
    name: "GMT -09:30",
    value: "-09:30",
  },
  {
    name: "GMT -09:00",
    value: "-09:00",
  },
  {
    name: "GMT -08:00",
    value: "-08:00",
  },
  {
    name: "GMT -07:00",
    value: "-07:00",
  },
  {
    name: "GMT -06:00",
    value: "-06:00",
  },
  {
    name: "GMT -05:00",
    value: "-05:00",
  },
  {
    name: "GMT -04:00",
    value: "-04:00",
  },
  {
    name: "GMT -03:30",
    value: "-03:30",
  },
  {
    name: "GMT -03:00",
    value: "-03:00",
  },
  {
    name: "GMT -02:00",
    value: "-02:00",
  },
  {
    name: "GMT -01:00",
    value: "-01:00",
  },
  {
    name: "GMT +00:00",
    value: "+00:00",
  },
  {
    name: "GMT +01:00",
    value: "+01:00",
  },
  {
    name: "GMT +02:00",
    value: "+02:00",
  },
  {
    name: "GMT +03:00",
    value: "+03:00",
  },
  {
    name: "GMT +03:30",
    value: "+03:30",
  },
  {
    name: "GMT +04:00",
    value: "+04:00",
  },
  {
    name: "GMT +04:30",
    value: "+04:30",
  },
  {
    name: "GMT +05:00",
    value: "+05:00",
  },
  {
    name: "GMT +05:30",
    value: "+05:30",
  },
  {
    name: "GMT +05:45",
    value: "+05:45",
  },
  {
    name: "GMT +06:00",
    value: "+06:00",
  },
  {
    name: "GMT +06:30",
    value: "+06:30",
  },
  {
    name: "GMT +07:00",
    value: "+07:00",
  },
  {
    name: "GMT +08:00",
    value: "+08:00",
  },
  {
    name: "GMT +08:45",
    value: "+08:45",
  },
  {
    name: "GMT +09:00",
    value: "+09:00",
  },
  {
    name: "GMT +09:30",
    value: "+09:30",
  },
  {
    name: "GMT +10:00",
    value: "+10:00",
  },
  {
    name: "GMT +10:30",
    value: "+10:30",
  },
  {
    name: "GMT +11:00",
    value: "+11:00",
  },
  {
    name: "GMT +12:00",
    value: "+12:00",
  },
  {
    name: "GMT +12:45",
    value: "+12:45",
  },
  {
    name: "GMT +13:00",
    value: "+13:00",
  },
  {
    name: "GMT +14:00",
    value: "+14:00",
  },
];
