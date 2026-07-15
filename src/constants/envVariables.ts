type OidcStandardClaims = {
  name?: string;
  preferred_username?: string;
  nickname?: string;
};

export type OidcUsername = keyof Pick<
  OidcStandardClaims,
  "name" | "preferred_username" | "nickname"
>;

declare global {
  // ATTENTION: when adding a new environment variable, make sure to add it to the `generateEnvConfig` method below and
  // ensure it’s surfaced via Vite (see vite.config.ts `define`) or use import.meta.env if you switch to that pattern.
  interface Window {
    _env_: {
      DISABLE_TENANT_PREFIL_FROM_DOMAIN: string;
      API_URL: string;
      STELLAR_EXPERT_URL: string;
      HORIZON_URL: string;
      RPC_ENABLED: boolean;
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

const env = import.meta.env as ImportMetaEnv & {
  REACT_APP_DISABLE_WINDOW_ENV?: string;
  REACT_APP_API_URL?: string;
  REACT_APP_DISABLE_TENANT_PREFIL_FROM_DOMAIN?: string;
  REACT_APP_STELLAR_EXPERT_URL?: string;
  REACT_APP_HORIZON_URL?: string;
  REACT_APP_RPC_ENABLED?: string;
  REACT_APP_RECAPTCHA_SITE_KEY?: string;
  REACT_APP_SINGLE_TENANT_MODE?: string;
  REACT_APP_USE_SSO?: string;
  REACT_APP_OIDC_AUTHORITY?: string;
  REACT_APP_OIDC_CLIENT_ID?: string;
  REACT_APP_OIDC_REDIRECT_URI?: string;
  REACT_APP_OIDC_SCOPE?: string;
  REACT_APP_OIDC_USERNAME_MAPPING?: string;
};

const generateEnvConfig = async () => {
  if (env.REACT_APP_DISABLE_WINDOW_ENV !== "true") {
    try {
      const response = await fetch(WINDOW_ENV_PATH);
      const text = await response.text();

      if (response.ok && text.includes("window._env_")) {
        const script = new Function(text);
        script.apply(null);
      }
    } catch {
      // Fall back to process env values when the window config is unavailable.
    }
  }

  const windowEnv = window._env_ ?? ({} as Partial<Window["_env_"]>);

  return {
    API_URL: env.REACT_APP_API_URL || windowEnv.API_URL || "",
    DISABLE_TENANT_PREFIL_FROM_DOMAIN:
      env.REACT_APP_DISABLE_TENANT_PREFIL_FROM_DOMAIN ||
      windowEnv.DISABLE_TENANT_PREFIL_FROM_DOMAIN ||
      "",
    STELLAR_EXPERT_URL: env.REACT_APP_STELLAR_EXPERT_URL || windowEnv.STELLAR_EXPERT_URL || "",
    HORIZON_URL: env.REACT_APP_HORIZON_URL || windowEnv.HORIZON_URL || "",
    RPC_ENABLED: Boolean(env.REACT_APP_RPC_ENABLED || windowEnv.RPC_ENABLED),
    RECAPTCHA_SITE_KEY: env.REACT_APP_RECAPTCHA_SITE_KEY || windowEnv.RECAPTCHA_SITE_KEY || "",
    SINGLE_TENANT_MODE: Boolean(env.REACT_APP_SINGLE_TENANT_MODE || windowEnv.SINGLE_TENANT_MODE),
    USE_SSO: Boolean(env.REACT_APP_USE_SSO || windowEnv.USE_SSO),
    OIDC_AUTHORITY: env.REACT_APP_OIDC_AUTHORITY || windowEnv.OIDC_AUTHORITY,
    OIDC_CLIENT_ID: env.REACT_APP_OIDC_CLIENT_ID || windowEnv.OIDC_CLIENT_ID,
    OIDC_REDIRECT_URI: env.REACT_APP_OIDC_REDIRECT_URI || windowEnv.OIDC_REDIRECT_URI,
    OIDC_SCOPE: env.REACT_APP_OIDC_SCOPE || windowEnv.OIDC_SCOPE,
    OIDC_USERNAME_MAPPING:
      ((env.REACT_APP_OIDC_USERNAME_MAPPING || windowEnv.OIDC_USERNAME_MAPPING) as OidcUsername) ||
      undefined,
  };
};

export const {
  DISABLE_TENANT_PREFIL_FROM_DOMAIN,
  API_URL,
  STELLAR_EXPERT_URL,
  HORIZON_URL,
  RPC_ENABLED,
  RECAPTCHA_SITE_KEY,
  SINGLE_TENANT_MODE,
  USE_SSO,
  OIDC_AUTHORITY,
  OIDC_CLIENT_ID,
  OIDC_REDIRECT_URI,
  OIDC_SCOPE,
  OIDC_USERNAME_MAPPING,
} = await generateEnvConfig();
