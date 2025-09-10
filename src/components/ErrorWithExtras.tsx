import { AppError } from "@/types";

export const ErrorWithExtras = ({ appError }: { appError: AppError }) => {
  // Handle specific wallet-related error messages
  const getEnhancedErrorMessage = (message: string): string => {
    if (message.includes("no receiver wallet")) {
      return "This wallet type requires manual registration for the receiver. Please ensure the receiver has registered this wallet before attempting payment.";
    }
    if (message.includes("receiver verifications")) {
      return "The receiver must complete verification before receiving payments. Please ask the receiver to complete the verification process.";
    }
    if (message.includes("user_managed")) {
      return "User-managed wallets cannot be automatically registered. The receiver must register this wallet manually.";
    }
    return message;
  };

  return (
    <>
      <div>{getEnhancedErrorMessage(appError.message)}</div>
      {appError.extras ? (
        <ul className="ErrorExtras">
          {Object.entries(appError.extras).map(([key, value]) => (
            <li key={key}>{`${key}: ${value}`}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
};
