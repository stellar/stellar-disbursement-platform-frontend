import { Text } from "@stellar/design-system";

import { shortenAccountKey } from "@/helpers/shortenAccountKey";
import { CreateReceiverRequest, VerificationFieldMap } from "@/types";

interface ReceiverConfirmationProps {
  receiverData: CreateReceiverRequest;
}

interface ConfirmationSectionProps {
  label: string;
  children: React.ReactNode;
}

interface ConfirmationItemProps {
  field?: string;
  value: React.ReactNode;
}

const ConfirmationSection: React.FC<ConfirmationSectionProps> = ({ label, children }) => (
  <div className="ReceiverCreateModal__confirmation__section">
    <Text
      size="sm"
      weight="semi-bold"
      color="gray-12"
      as="div"
      className="ReceiverCreateModal__confirmation__label"
    >
      {label}
    </Text>
    <div className="ReceiverCreateModal__confirmation__content">{children}</div>
  </div>
);

const ConfirmationItem: React.FC<ConfirmationItemProps> = ({ field, value }) => (
  <div className="ReceiverCreateModal__confirmation__item">
    {field && (
      <Text
        size="sm"
        weight="medium"
        color="gray-10"
        as="span"
        className="ReceiverCreateModal__confirmation__field"
      >
        {field}
      </Text>
    )}
    <Text size="sm" color="gray-11" as="span" className="ReceiverCreateModal__confirmation__value">
      {value}
    </Text>
  </div>
);

export const ReceiverConfirmation: React.FC<ReceiverConfirmationProps> = ({ receiverData }) => {
  const hasWallets = receiverData.wallets?.length > 0;
  const hasVerifications = receiverData.verifications?.length > 0;
  const hasEmail = receiverData.email?.trim() !== "";
  const hasPhone = receiverData.phone_number?.trim() !== "";
  const hasExternalId = receiverData.external_id?.trim() !== "";

  return (
    <div className="ReceiverCreateModal__confirmation">
      <div className="ReceiverCreateModal__confirmation__details">
        {/* Contact Information */}
        <ConfirmationSection label="Contact Information:">
          {hasEmail ? <ConfirmationItem field="Email:" value={receiverData.email} /> : null}
          {hasPhone ? <ConfirmationItem field="Phone:" value={receiverData.phone_number} /> : null}
          {!hasEmail && !hasPhone ? (
            <Text
              size="sm"
              color="gray-08"
              as="div"
              className="ReceiverCreateModal__confirmation__empty"
              style={{ fontStyle: "italic" }}
            >
              No contact information provided
            </Text>
          ) : null}
        </ConfirmationSection>

        {/* External ID */}
        {hasExternalId ? (
          <ConfirmationSection label="External ID:">
            <ConfirmationItem value={receiverData.external_id} />
          </ConfirmationSection>
        ) : null}

        {/* Wallets */}
        {hasWallets ? (
          <ConfirmationSection label="Wallet(s):">
            {receiverData.wallets.map((wallet, index) => (
              <ConfirmationItem
                key={index}
                value={
                  <>
                    {shortenAccountKey(wallet.address, 8, 8)}
                    {wallet.memo ? (
                      <Text
                        size="sm"
                        color="gray-09"
                        as="span"
                        className="ReceiverCreateModal__confirmation__memo"
                        style={{ fontFamily: "var(--sds-ff-monospace)" }}
                      >
                        {" "}
                        (Memo: {wallet.memo})
                      </Text>
                    ) : null}
                  </>
                }
              />
            ))}
          </ConfirmationSection>
        ) : null}

        {/* Verifications */}
        {hasVerifications ? (
          <ConfirmationSection label="Verification(s):">
            {receiverData.verifications.map((v, index) => (
              <ConfirmationItem
                key={index}
                field={`${VerificationFieldMap[v.type] || v.type}:`}
                value={v.value}
              />
            ))}
          </ConfirmationSection>
        ) : null}
      </div>
    </div>
  );
};
