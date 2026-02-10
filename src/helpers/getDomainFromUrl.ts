const DOMAIN_REGEX = /([\w-]+\.(?:com|co))$/i;

/**
 * Extracts the registrable domain (e.g. domain.com) from a full URL.
 * For hosts ending in .com or .co, returns the label immediately before the TLD plus the TLD.
 * Otherwise returns the host as-is (e.g. localhost, .org).
 */
export function getDomainFromUrl(url: string): string {
  const noProtocol = url.replace(/^https?:\/\//i, "").trim();
  const host = noProtocol.split("/")[0].split("?")[0];
  const match = DOMAIN_REGEX.exec(host);
  return match ? match[1] : host;
}
