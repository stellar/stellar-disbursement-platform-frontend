export const isValidWalletAddress = (address: string): boolean => {
  const WALLET_ADDRESS_PREFIX = "G";
  const WALLET_ADDRESS_LENGTH = 56;

  // Check if address is a string and not empty
  if (!address || typeof address !== "string") {
    return false;
  }

  const trimmedAddress = address.trim();

  // Check if it starts with G and has the correct length
  return (
    trimmedAddress.startsWith(WALLET_ADDRESS_PREFIX) &&
    trimmedAddress.length === WALLET_ADDRESS_LENGTH
  );
};
