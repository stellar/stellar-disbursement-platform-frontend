export const getSdpTenantName = (organizationName?: string): string =>
  organizationName ?? window.location.hostname.split(".")[0];
