import { shortenAccountKey } from "@/helpers/shortenAccountKey";
import { CreateReceiverRequest, VerificationFieldMap } from "@/types";

interface ReceiverConfirmationProps {
  receiverData: CreateReceiverRequest;
}

export const ReceiverConfirmation: React.FC<ReceiverConfirmationProps> = ({ receiverData }) => {
  const hasWallets = receiverData.wallets && receiverData.wallets.length > 0;
  const hasVerifications = receiverData.verifications && receiverData.verifications.length > 0;
  const hasEmail = receiverData.email && receiverData.email.trim() !== "";
  const hasPhone = receiverData.phone_number && receiverData.phone_number.trim() !== "";
  const hasExternalId = receiverData.external_id && receiverData.external_id.trim() !== "";

  return (
    <div className="ReceiverCreateModal__confirmation">
      <div className="ReceiverCreateModal__confirmation__details">
        {/* Contact Information */}
        <div className="ReceiverCreateModal__confirmation__section">
          <div className="ReceiverCreateModal__confirmation__label">Contact Information:</div>
          <div className="ReceiverCreateModal__confirmation__content">
            {hasEmail && (
              <div className="ReceiverCreateModal__confirmation__item">
                <span className="ReceiverCreateModal__confirmation__field">Email:</span>
                <span className="ReceiverCreateModal__confirmation__value">
                  {receiverData.email}
                </span>
              </div>
            )}
            {hasPhone && (
              <div className="ReceiverCreateModal__confirmation__item">
                <span className="ReceiverCreateModal__confirmation__field">Phone:</span>
                <span className="ReceiverCreateModal__confirmation__value">
                  {receiverData.phone_number}
                </span>
              </div>
            )}
            {!hasEmail && !hasPhone && (
              <div className="ReceiverCreateModal__confirmation__empty">
                No contact information provided
              </div>
            )}
          </div>
        </div>

        {/* External ID */}
        {hasExternalId && (
          <div className="ReceiverCreateModal__confirmation__section">
            <div className="ReceiverCreateModal__confirmation__label">External ID:</div>
            <div className="ReceiverCreateModal__confirmation__content">
              <div className="ReceiverCreateModal__confirmation__item">
                <span className="ReceiverCreateModal__confirmation__value">
                  {receiverData.external_id}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Wallets */}
        {hasWallets && (
          <div className="ReceiverCreateModal__confirmation__section">
            <div className="ReceiverCreateModal__confirmation__label">Wallet(s):</div>
            <div className="ReceiverCreateModal__confirmation__content">
              {receiverData.wallets.map((wallet, index) => (
                <div key={index} className="ReceiverCreateModal__confirmation__item">
                  <span className="ReceiverCreateModal__confirmation__value">
                    {shortenAccountKey(wallet.address, 8, 8)}
                    {wallet.memo && (
                      <span className="ReceiverCreateModal__confirmation__memo">
                        {" "}
                        (Memo: {wallet.memo})
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verifications */}
        {hasVerifications && (
          <div className="ReceiverCreateModal__confirmation__section">
            <div className="ReceiverCreateModal__confirmation__label">Verification(s):</div>
            <div className="ReceiverCreateModal__confirmation__content">
              {receiverData.verifications.map((v, index) => (
                <div key={index} className="ReceiverCreateModal__confirmation__item">
                  <span className="ReceiverCreateModal__confirmation__field">
                    {VerificationFieldMap[v.type] || v.type}:
                  </span>
                  <span className="ReceiverCreateModal__confirmation__value">{v.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
