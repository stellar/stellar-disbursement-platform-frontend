/**
 * Extracts the filename from a Content-Disposition response header.
 * Handles both quoted (`filename="report.pdf"`) and unquoted (`filename=report.pdf`) values.
 * Returns the provided fallback when the header is missing or does not contain a filename.
 */
export function getFilenameFromContentDisposition(header: string | null, fallback: string): string {
  if (!header) return fallback;
  const re = /filename=(?:"([^"]+)"|([^;\s]+))/;
  const match = re.exec(header);
  return match ? (match[1] ?? match[2]).trim() : fallback;
}
