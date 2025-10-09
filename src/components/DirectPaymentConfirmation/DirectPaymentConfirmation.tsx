import { Notification } from "@stellar/design-system";

import { shortenAccountKey } from "@/helpers/shortenAccountKey";

import { ApiReceiver, CreateDirectPaymentRequest } from "@/types";

import "./styles.scss";

interface DirectPaymentConfirmationProps {
  paymentData: CreateDirectPaymentRequest;
  selectedReceiver: ApiReceiver | null;
  receiverSearch: string;
}

interface ConfirmationRowProps {
  label: string;
  children: React.ReactNode;
}

const ConfirmationRow: React.FC<ConfirmationRowProps> = ({ label, children }) => (
  <div className="DirectPaymentConfirmation__row">
    <span className="DirectPaymentConfirmation__label">{label}</span>
    <span className="DirectPaymentConfirmation__value">{children}</span>
  </div>
);

export const DirectPaymentConfirmation: React.FC<DirectPaymentConfirmationProps> = ({
  paymentData,
  selectedReceiver,
  receiverSearch,
}) => {
  const getReceiverDisplayInfo = (receiver: ApiReceiver, searchQuery: string): string => {
    const query = searchQuery.toLowerCase();
    if (receiver.email?.toLowerCase().includes(query)) return receiver.email;
    if (receiver.phone_number?.includes(query)) return receiver.phone_number;
    if (receiver.external_id?.toLowerCase().includes(query)) return receiver.external_id;
    return receiver.phone_number || receiver.email || receiver.external_id || "";
  };

  const isWalletAddress = paymentData.receiver.wallet_address;
  const receiverInfo = isWalletAddress
    ? `Wallet Address: ${shortenAccountKey(paymentData.receiver.wallet_address || "", 6, 8)}`
    : selectedReceiver
      ? getReceiverDisplayInfo(selectedReceiver, receiverSearch)
      : "Unknown Receiver";

  const selectedWallet =
    !isWalletAddress && selectedReceiver && paymentData.wallet?.id
      ? selectedReceiver.wallets.find((w) => w.wallet.id === paymentData.wallet?.id)
      : null;
  const walletAddress = selectedWallet?.stellar_address || paymentData.wallet?.address;
  const walletMemo = selectedWallet?.stellar_memo;

  return (
    <div className="DirectPaymentConfirmation">
      <div className="DirectPaymentConfirmation__content">
        <Notification variant="warning" title="Warning" isFilled={true}>
          <p>Please review the payment details below. This action cannot be undone.</p>
        </Notification>

        <div className="DirectPaymentConfirmation__details">
          <ConfirmationRow label="Amount:">
            {paymentData.amount} {paymentData.asset.code}
          </ConfirmationRow>

          <ConfirmationRow label="Receiver:">{receiverInfo}</ConfirmationRow>

          {walletAddress && (
            <ConfirmationRow label="Wallet:">
              {selectedWallet?.wallet?.name && (
                <span className="DirectPaymentConfirmation__valueProvider">
                  {selectedWallet.wallet.name}
                </span>
              )}
              <span>{shortenAccountKey(walletAddress, 10, 10)}</span>
              {walletMemo && (
                <span className="DirectPaymentConfirmation__valueMemo">Memo: {walletMemo}</span>
              )}
            </ConfirmationRow>
          )}

          {paymentData.external_payment_id && (
            <ConfirmationRow label="External Payment ID:">
              {paymentData.external_payment_id}
            </ConfirmationRow>
          )}
        </div>
      </div>
    </div>
  );
};
