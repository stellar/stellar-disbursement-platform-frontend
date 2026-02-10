export function stripProtocolFromBaseUrl(url: string): string {
  return url.replace(/^https?:\/\//i, "");
}
