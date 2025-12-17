const WALLET_ADDRESS_LENGTH = 56;

const normalize = (address: string) => address.trim().toUpperCase();

export const isContractAddress = (address: string): boolean => {
  if (typeof address !== "string") {
    return false;
  }

  const normalized = normalize(address);
  return normalized.length === WALLET_ADDRESS_LENGTH && normalized.startsWith("C");
};

export const isClassicWalletAddress = (address: string): boolean => {
  if (typeof address !== "string") {
    return false;
  }

  const normalized = normalize(address);
  return normalized.length === WALLET_ADDRESS_LENGTH && normalized.startsWith("G");
};

export const isValidWalletAddress = (address: string): boolean => {
  if (typeof address !== "string") {
    return false;
  }

  const normalized = normalize(address);

  if (normalized.length !== WALLET_ADDRESS_LENGTH) {
    return false;
  }

  return normalized.startsWith("G") || normalized.startsWith("C");
};
