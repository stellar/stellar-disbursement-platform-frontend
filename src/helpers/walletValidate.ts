import { StrKey } from "@stellar/stellar-sdk";

const normalize = (address: string) => address.trim().toUpperCase();

export const isContractAddress = (address: string): boolean => {
  if (typeof address !== "string") {
    return false;
  }

  return StrKey.isValidContract(normalize(address));
};

export const isClassicWalletAddress = (address: string): boolean => {
  if (typeof address !== "string") {
    return false;
  }

  return StrKey.isValidEd25519PublicKey(normalize(address));
};

export const isValidWalletAddress = (address: string): boolean => {
  if (typeof address !== "string") {
    return false;
  }

  const normalized = normalize(address);
  return StrKey.isValidEd25519PublicKey(normalized) || StrKey.isValidContract(normalized);
};
