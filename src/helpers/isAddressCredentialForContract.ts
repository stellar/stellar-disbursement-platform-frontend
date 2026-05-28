import { Address, xdr } from "@stellar/stellar-sdk";

export const isAddressCredentialForContract = (
  entry: xdr.SorobanAuthorizationEntry,
  contractAddress: string,
): boolean => {
  if (entry.credentials().switch() !== xdr.SorobanCredentialsType.sorobanCredentialsAddress()) {
    return false;
  }

  const addressCredentials = entry.credentials().address();
  const address = addressCredentials.address();

  if (address.switch() !== xdr.ScAddressType.scAddressTypeContract()) {
    return false;
  }

  return Address.fromScAddress(address).toString() === contractAddress;
};
