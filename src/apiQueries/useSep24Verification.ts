import { useMutation } from "@tanstack/react-query";

import { depositWithSep24 } from "@/helpers/sep24InteractiveDeposit/depositWithSep24";
import { authenticateWithSep45 } from "@/helpers/sep45Authentication/authenticateWithSep45";

export interface Sep24VerificationParams {
  assetCode?: string;
  contractAddress?: string;
  credentialId?: string;
}

export const useSep24Verification = () => {
  return useMutation<string, Error, Sep24VerificationParams>({
    mutationFn: async ({ assetCode, contractAddress, credentialId }) => {
      if (!contractAddress) {
        throw new Error("Wallet contract address is missing");
      }
      if (!credentialId) {
        throw new Error("Wallet credential ID is missing");
      }
      if (!assetCode) {
        throw new Error("Pending asset code is missing");
      }

      const token = await authenticateWithSep45(contractAddress, credentialId);
      return depositWithSep24(assetCode, contractAddress, token);
    },
  });
};
