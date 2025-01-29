import { OidcStandardClaims } from "oidc-client-ts";

export type OidcUsername = keyof Pick<
  OidcStandardClaims,
  "name" | "preferred_username" | "nickname"
>;

declare global {
  // ATTENTION: when adding a new environment variable, make sure to add it to the `generateEnvConfig` method below and
  // `new DefinePlugin({"process.env": ...})` in the webpack config ad well.
  interface Window {
    _env_: {
      DISABLE_TENANT_PREFIL_FROM_DOMAIN: string;
      API_URL: string;
      STELLAR_EXPERT_URL: string;
      HORIZON_URL: string;
      RECAPTCHA_SITE_KEY: string;
      SINGLE_TENANT_MODE: boolean;

      USE_SSO?: boolean;
      OIDC_AUTHORITY?: string;
      OIDC_CLIENT_ID?: string;
      OIDC_REDIRECT_URI?: string;
      OIDC_SCOPE?: string;
      OIDC_USERNAME_MAPPING?: OidcUsername;
    };
  }
}

const WINDOW_ENV_PATH = "/settings/env-config.js";

const generateEnvConfig = async () => {
  if (process?.env?.REACT_APP_DISABLE_WINDOW_ENV !== "true") {
    const response = await fetch(WINDOW_ENV_PATH);
    const text = await response.text();

    const script = new Function(text);
    script.apply(null);
  }

  return {
    API_URL: process?.env?.REACT_APP_API_URL || window._env_.API_URL,
    DISABLE_TENANT_PREFIL_FROM_DOMAIN:
      process?.env?.REACT_APP_DISABLE_TENANT_PREFIL_FROM_DOMAIN ||
      window._env_.DISABLE_TENANT_PREFIL_FROM_DOMAIN,
    STELLAR_EXPERT_URL:
      process?.env?.REACT_APP_STELLAR_EXPERT_URL ||
      window._env_.STELLAR_EXPERT_URL,
    HORIZON_URL:
      process?.env?.REACT_APP_HORIZON_URL || window._env_.HORIZON_URL,
    RECAPTCHA_SITE_KEY:
      process?.env?.REACT_APP_RECAPTCHA_SITE_KEY ||
      window._env_.RECAPTCHA_SITE_KEY,
    SINGLE_TENANT_MODE: Boolean(
      process?.env?.REACT_APP_SINGLE_TENANT_MODE ||
        window._env_.SINGLE_TENANT_MODE,
    ),
    USE_SSO: Boolean(process?.env?.REACT_APP_USE_SSO || window?._env_?.USE_SSO),
    OIDC_AUTHORITY:
      process?.env?.REACT_APP_OIDC_AUTHORITY || window?._env_?.OIDC_AUTHORITY,
    OIDC_CLIENT_ID:
      process?.env?.REACT_APP_OIDC_CLIENT_ID || window?._env_?.OIDC_CLIENT_ID,
    OIDC_REDIRECT_URI:
      process?.env?.REACT_APP_OIDC_REDIRECT_URI ||
      window?._env_?.OIDC_REDIRECT_URI,
    OIDC_SCOPE: process?.env?.REACT_APP_OIDC_SCOPE || window?._env_?.OIDC_SCOPE,
    OIDC_USERNAME_MAPPING:
      ((process?.env?.REACT_APP_OIDC_USERNAME_MAPPING ||
        window?._env_?.OIDC_USERNAME_MAPPING) as OidcUsername) || undefined,
  };
};

export const {
  DISABLE_TENANT_PREFIL_FROM_DOMAIN,
  API_URL,
  STELLAR_EXPERT_URL,
  HORIZON_URL,
  RECAPTCHA_SITE_KEY,
  SINGLE_TENANT_MODE,
  USE_SSO,
  OIDC_AUTHORITY,
  OIDC_CLIENT_ID,
  OIDC_REDIRECT_URI,
  OIDC_SCOPE,
  OIDC_USERNAME_MAPPING,
} = await generateEnvConfig();
