export type Sep24InteractiveDepositDetails = {
  popupUrl: string;
  transactionId: string;
};

export const depositWithSep24 = async (): Promise<Sep24InteractiveDepositDetails> => {
  // TODO: Start SEP-24 interactive deposit flow
  throw new Error("depositWithSep24 is not implemented");
};
