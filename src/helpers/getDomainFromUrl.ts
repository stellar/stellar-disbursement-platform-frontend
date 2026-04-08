const DOMAIN_REGEX = /([\w-]+\.(?:com|co))$/i;

/**
 * Extracts the registrable domain from a URL string, used to build the
 * `base_url` query parameter for statement and transaction notice exports.
 *
 * Uses the URL constructor to safely parse the input, which normalizes the
 * hostname by stripping ports (e.g. localhost:3000 -> localhost), userinfo
 * (e.g. user@host), paths, and query strings. If the input has no protocol,
 * one is prepended so the URL constructor can parse it correctly.
 *
 * For hosts ending in .com or .co the DOMAIN_REGEX strips subdomains
 * (e.g. app.example.com -> example.com). All other hosts are returned as-is
 * (e.g. localhost, .org domains).
 *
 * Falls back to manual string splitting when the URL constructor throws
 * (e.g. for malformed input that cannot be parsed).
 */
export function getDomainFromUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return "";
  }

  let hostname: string;
  try {
    // Ensure the string has a protocol so that the URL constructor can parse it.
    const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed);
    const urlObj = new URL(hasProtocol ? trimmed : `http://${trimmed}`);
    hostname = urlObj.hostname;
  } catch {
    // Fallback to the previous best-effort behavior if URL parsing fails.
    const noProtocol = trimmed.replace(/^https?:\/\//i, "");
    hostname = noProtocol.split("/")[0].split("?")[0];
  }

  const match = DOMAIN_REGEX.exec(hostname);
  return match ? match[1] : hostname;
}
