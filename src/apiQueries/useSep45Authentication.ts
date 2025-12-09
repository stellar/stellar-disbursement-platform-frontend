import { useMutation } from "@tanstack/react-query";

import { authenticateWithSep45 } from "@/helpers/sep45Authentication/authenticateWithSep45";

export interface Sep45AuthenticationParams {
  contractAddress?: string;
  credentialId?: string;
}

export const useSep45Authentication = () => {
  return useMutation<string, Error, Sep45AuthenticationParams>({
    mutationFn: async ({ contractAddress, credentialId }) => {
      if (!contractAddress) {
        throw new Error("Wallet contract address is missing");
      }
      if (!credentialId) {
        throw new Error("Wallet credential ID is missing");
      }

      return authenticateWithSep45(contractAddress, credentialId);
    },
  });
};
