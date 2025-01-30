import { LOCAL_STORAGE_TENANT_NAME } from "constants/settings";

export const localStorageTenantName = {
  get: () => {
    return localStorage.getItem(LOCAL_STORAGE_TENANT_NAME);
  },
  set: (token: string) => {
    return localStorage.setItem(LOCAL_STORAGE_TENANT_NAME, token);
  },
  remove: () => {
    return localStorage.removeItem(LOCAL_STORAGE_TENANT_NAME);
  },
};
