export const parseAllowedIPs = (input: string): string[] => {
  if (!input.trim()) {
    return [];
  }

  const ips = input
    .split(/[\n,]/)
    .map((ip) => ip.trim())
    .filter((ip) => ip.length > 0);

  return ips;
};
