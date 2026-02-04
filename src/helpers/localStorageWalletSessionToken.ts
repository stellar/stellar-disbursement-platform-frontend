import { LOCAL_STORAGE_WALLET_SESSION_TOKEN } from "@/constants/settings";

export const localStorageWalletSessionToken = {
  get: () => {
    return localStorage.getItem(LOCAL_STORAGE_WALLET_SESSION_TOKEN);
  },
  set: (token: string) => {
    return localStorage.setItem(LOCAL_STORAGE_WALLET_SESSION_TOKEN, token);
  },
  remove: () => {
    return localStorage.removeItem(LOCAL_STORAGE_WALLET_SESSION_TOKEN);
  },
};
