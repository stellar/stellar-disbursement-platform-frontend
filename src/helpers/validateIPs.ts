import { parseAllowedIPs } from "./parseIPs";

export const validateIP = (ip: string): boolean => {
  if (ip.includes("/")) {
    const parts = ip.split("/");
    if (parts.length !== 2) return false;

    const [ipPart, maskPart] = parts;
    const mask = parseInt(maskPart, 10);

    if (!isValidIPAddress(ipPart)) return false;

    return mask >= 0 && mask <= 32;
  } else {
    return isValidIPAddress(ip);
  }
};

const isValidIPAddress = (ip: string): boolean => {
  const ipv4Regex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
  if (ipv4Regex.test(ip)) {
    const parts = ip.split(".");
    return (
      parts.length === 4 &&
      parts.every((part) => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
      })
    );
  }

  return false;
};

export const validateAllowedIPs = (
  allowedIPs: string,
): { isValid: boolean; error?: string } => {
  const ips = parseAllowedIPs(allowedIPs);

  if (ips.length === 0) {
    return { isValid: true };
  }

  for (const ip of ips) {
    if (!validateIP(ip)) {
      if (ip.includes("/")) {
        return { isValid: false, error: `Invalid CIDR: ${ip}` };
      } else {
        return { isValid: false, error: `Invalid IP: ${ip}` };
      }
    }
  }

  return { isValid: true };
};
