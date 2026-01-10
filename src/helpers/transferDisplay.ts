import { amount as amountFormatter } from "@/helpers/formatIntlNumber";
import { shortenAccountKey } from "@/helpers/shortenAccountKey";

export const getTransferAmountDisplay = (amount: string, assetCode: string) => {
  const numericAmount = Number.parseFloat(amount);
  const formattedAmount = Number.isFinite(numericAmount)
    ? amountFormatter.format(numericAmount)
    : amount;

  return formattedAmount && assetCode
    ? `${formattedAmount} ${assetCode}`
    : formattedAmount || assetCode;
};

export const getTransferDisplay = (amount: string, assetCode: string, destination: string) => {
  const displayAmount = getTransferAmountDisplay(amount, assetCode);
  const trimmedDestination = destination.trim();
  const destinationDisplay = trimmedDestination
    ? shortenAccountKey(trimmedDestination, 5, 5)
    : "Wallet address unavailable";

  return { displayAmount, destinationDisplay };
};
