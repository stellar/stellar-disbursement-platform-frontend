# stellar-relief-backoffice

## Add `/public/settings/env-config.js` file locally with the following keys:

### SSO

- USE_SSO - variable for switch to current/old Login or to SSO Login;
- If you are going to use SSO - you need provide OIDC_REDIRECT_URI to specialist
  who will configure OIDC Provider and get from them OIDC_AUTHORITY,
  OIDC_CLIENT_ID, OIDC_SCOPE, OIDC_USERNAME_MAPPING;
- OIDC_USERNAME_MAPPING - is using for show in web page in "username" field;
- Options of OIDC_USERNAME_MAPPING you could find in ID Token body (in user
  claims) or in OIDC Provider configure page;
- When you will switch to using SSO - it must be synchronously changed in
  BackEnd side - as in current moment its possible to use only tokens from one
  issuer;

```javascript
window._env_ = {
  API_URL: "",
  STELLAR_EXPERT_URL: "",
  HORIZON_URL: "",
  USDC_ASSET_ISSUER: "",
  RECAPTCHA_SITE_KEY: "",

  USE_SSO: false,
  OIDC_AUTHORITY:
    "https://<tenant_name>.b2clogin.com/<tenant_name>.onmicrosoft.com/<policy_name>",
  OIDC_CLIENT_ID: "<client_id>",
  OIDC_REDIRECT_URI: "http://localhost:3000/signin-oidc",
  OIDC_SCOPE: "openid",
  OIDC_USERNAME_MAPPING: "name",
};
```
