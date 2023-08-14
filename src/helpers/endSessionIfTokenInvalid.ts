import { sessionExpiredAction } from "store/ducks/userAccount";
import { SESSION_EXPIRED, USE_SSO } from "constants/settings";
import { singleUserStore } from "helpers/singleSingOn";

export const endSessionIfTokenInvalid = (error: string, dispatch: any) => {
  if (error === SESSION_EXPIRED) {
    if (USE_SSO) {
      // reset user store (from session storage)
      singleUserStore().then();
    }
    dispatch(sessionExpiredAction());
  }
};
