export const isValidWalletAddress = (address: string): boolean => {
  const WALLET_ADDRESS_PREFIX = "G";
  const WALLET_ADDRESS_LENGTH = 56;
  return address.startsWith(WALLET_ADDRESS_PREFIX) && address.length === WALLET_ADDRESS_LENGTH;
};
