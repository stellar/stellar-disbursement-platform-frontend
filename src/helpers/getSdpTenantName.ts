import { DISABLE_TENANT_PREFIL_FROM_DOMAIN } from "constants/envVariables";
import { localStorageTenantName } from "helpers/localStorageTenantName";

export const getSdpTenantName = (organizationName?: string): string => {
  const orgName = organizationName || localStorageTenantName.get();

  if (DISABLE_TENANT_PREFIL_FROM_DOMAIN === "true") {
    return orgName || "";
  }

  return orgName || window.location.hostname.split(".")[0];
};
