import { UserRole } from "types";

export const PROJECT_NAME = "stellarDisbursementPlatform";
export const LOCALE = "en-US";
export const RESET_STORE_ACTION_TYPE = "RESET";
export const API_URL = window._env_.API_URL;
export const STELLAR_EXPERT_URL = window._env_.STELLAR_EXPERT_URL;
export const HORIZON_URL = window._env_.HORIZON_URL;
export const RECAPTCHA_SITE_KEY = window._env_.RECAPTCHA_SITE_KEY;

export const USE_SSO = window._env_.USE_SSO;
export const OIDC_AUTHORITY = window._env_.OIDC_AUTHORITY;
export const OIDC_CLIENT_ID = window._env_.OIDC_CLIENT_ID;
export const OIDC_REDIRECT_URI = window._env_.OIDC_REDIRECT_URI;
export const OIDC_SCOPE = window._env_.OIDC_SCOPE;
export const OIDC_USERNAME_MAPPING = window._env_.OIDC_USERNAME_MAPPING;

export const GENERIC_ERROR_MESSAGE = "Something went wrong, please try again";
export const SESSION_EXPIRED = "SESSION EXPIRED";
export const SESSION_EXPIRED_EVENT = "sdp_session_expired_event";
export const LOCAL_STORAGE_SESSION_TOKEN = "sdp_session";
export const LOCAL_STORAGE_DEVICE_ID = "sdp_deviceID";
export const UI_STATUS_DISBURSEMENT = "STARTED,PAUSED,COMPLETED";
export const UI_STATUS_DISBURSEMENT_DRAFT = "DRAFT,READY";

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
  WALLETS = "/wallets",
  ANALYTICS = "/analytics",
  PROFILE = "/profile",
  SETTINGS = "/settings",
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
