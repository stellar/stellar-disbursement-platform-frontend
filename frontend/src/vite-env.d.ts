/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly REACT_APP_DISABLE_WINDOW_ENV: string;
  readonly REACT_APP_DISABLE_TENANT_PREFIL_FROM_DOMAIN: string;
  readonly REACT_APP_API_URL: string;
  readonly REACT_APP_STELLAR_EXPERT_URL: string;
  readonly REACT_APP_HORIZON_URL: string;
  readonly REACT_APP_RECAPTCHA_SITE_KEY: string;
  readonly REACT_APP_SINGLE_TENANT_MODE: string;
  readonly REACT_APP_USE_SSO: string;
  readonly REACT_APP_OIDC_AUTHORITY: string;
  readonly REACT_APP_OIDC_CLIENT_ID: string;
  readonly REACT_APP_OIDC_REDIRECT_URI: string;
  readonly REACT_APP_OIDC_SCOPE: string;
  readonly REACT_APP_OIDC_USERNAME_MAPPING: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
