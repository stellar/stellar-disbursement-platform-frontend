import { DISABLE_TENANT_PREFIL_FROM_DOMAIN } from "constants/envVariables";
import { localStorageTenantName } from "helpers/localStorageTenantName";

export const getSdpTenantName = (organizationName?: string): string => {
  if (DISABLE_TENANT_PREFIL_FROM_DOMAIN === "true") {
    return organizationName || localStorageTenantName.get() || "";
  }

  return organizationName ?? window.location.hostname.split(".")[0];
};
