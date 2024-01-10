import { OidcStandardClaims } from "oidc-client-ts";

export type OidcUsername = keyof Pick<
  OidcStandardClaims,
  "name" | "preferred_username" | "nickname"
>;

declare global {
  interface Window {
    _env_: {
      API_URL: string;
      STELLAR_EXPERT_URL: string;
      USDC_ASSET_ISSUER: string;
      HORIZON_URL: string;
      RECAPTCHA_SITE_KEY: string;

      USE_SSO: boolean;
      OIDC_AUTHORITY: string;
      OIDC_CLIENT_ID: string;
      OIDC_REDIRECT_URI: string;
      OIDC_SCOPE: string;
      OIDC_USERNAME_MAPPING: OidcUsername;
    };
  }
}

export const API_URL = process?.env?.REACT_APP_API_URL || window._env_.API_URL;
export const STELLAR_EXPERT_URL =
  process?.env?.REACT_APP_STELLAR_EXPERT_URL || window._env_.STELLAR_EXPERT_URL;
export const HORIZON_URL =
  process?.env?.REACT_APP_HORIZON_URL || window._env_.HORIZON_URL;
export const RECAPTCHA_SITE_KEY =
  process?.env?.REACT_APP_RECAPTCHA_SITE_KEY || window._env_.RECAPTCHA_SITE_KEY;
export const USE_SSO = Boolean(
  process?.env?.REACT_APP_USE_SSO || window._env_.USE_SSO,
);
export const OIDC_AUTHORITY =
  process?.env?.REACT_APP_OIDC_AUTHORITY || window._env_.OIDC_AUTHORITY;
export const OIDC_CLIENT_ID =
  process?.env?.REACT_APP_OIDC_CLIENT_ID || window._env_.OIDC_CLIENT_ID;
export const OIDC_REDIRECT_URI =
  process?.env?.REACT_APP_OIDC_REDIRECT_URI || window._env_.OIDC_REDIRECT_URI;
export const OIDC_SCOPE =
  process?.env?.REACT_APP_OIDC_SCOPE || window._env_.OIDC_SCOPE;
export const OIDC_USERNAME_MAPPING = (process?.env
  ?.REACT_APP_OIDC_USERNAME_MAPPING ||
  window._env_.OIDC_USERNAME_MAPPING) as OidcUsername;
