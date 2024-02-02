import { User, UserManager } from "oidc-client-ts";
import {
  OIDC_AUTHORITY,
  OIDC_CLIENT_ID,
  OIDC_REDIRECT_URI,
  OIDC_SCOPE,
} from "constants/envVariables";

const config = {
  authority: OIDC_AUTHORITY || "",
  client_id: OIDC_CLIENT_ID || "",
  redirect_uri: OIDC_REDIRECT_URI || "",
  scope: OIDC_SCOPE || "",
  automaticSilentRenew: false,
};

const userManager = new UserManager(config);

export async function signInRedirect() {
  await userManager.signinRedirect();
}

export function signInRedirectCallback() {
  return userManager.signinRedirectCallback();
}

export async function singleUserStore(user: User | null = null) {
  await userManager.storeUser(user);
}
