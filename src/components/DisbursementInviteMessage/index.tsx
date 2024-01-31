import { useEffect, useState } from "react";
import { Card, RadioButton, Textarea } from "@stellar/design-system";
import { useDispatch } from "react-redux";

import { useRedux } from "hooks/useRedux";
import { AppDispatch } from "store";
import { getOrgInfoAction } from "store/ducks/organization";

import "../ReceiverInviteMessage/styles.scss";

interface DisbursementInviteMessageProps {
  draftMessage?: string;
  isEditMessage: boolean;
  onChange?: (message: string) => void;
}

export const DisbursementInviteMessage = ({
  draftMessage,
  isEditMessage,
  onChange,
}: DisbursementInviteMessageProps) => {
  enum radioValue {
    ORGANIZATION = "organization",
    CUSTOM = "custom",
  }

  const standardOrgMessage =
    "You have a payment waiting for you from the {{.OrganizationName}}. Click {{.RegistrationLink}} to register.";
  const customMessagePlaceholder =
    "Input your registration invitation message for this disbursement here in the appropriate language. Make sure to say which organization the transaction is coming from. Keep your message short. A link to the wallet will be appended at the end.";

  const { organization } = useRedux("organization");
  const dispatch: AppDispatch = useDispatch();

  const [selectedOption, setSelectedOption] = useState(radioValue.ORGANIZATION);
  const [customMessageInput, setCustomMessageInput] = useState("");

  useEffect(() => {
    dispatch(getOrgInfoAction());
  }, [dispatch]);

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === radioValue.ORGANIZATION) {
      updateMessage("");
      setSelectedOption(radioValue.ORGANIZATION);
    } else {
      setSelectedOption(radioValue.CUSTOM);
    }
  };

  const updateMessage = (updatedDisbursementInviteMessage: string) => {
    setCustomMessageInput(updatedDisbursementInviteMessage);
    // Updating parent
    if (onChange) {
      onChange(updatedDisbursementInviteMessage);
    }
  };

  return (
    <>
      <Card>
        <div className="CardStack__card ReceiverInviteMessage">
          <div className="CardStack__title">Customize invite</div>

          <div className="Note">
            You can use the organization default message or customized text to
            invite your receivers to set up a wallet and receive funds for this
            disbursement. It contains a link to the appropriate wallet at the
            end of the message. Please check all values for accuracy.
          </div>

          {isEditMessage && (
            <div className="ReceiverInviteMessage__options">
              <RadioButton
                id="msg-std"
                name="disbursement-message"
                label="Default message"
                fieldSize="xs"
                value={radioValue.ORGANIZATION}
                onChange={handleOptionChange}
                checked={selectedOption === radioValue.ORGANIZATION}
              />
              <RadioButton
                id="msg-cst"
                name="disbursement-message"
                label="Custom message"
                fieldSize="xs"
                value={radioValue.CUSTOM}
                onChange={handleOptionChange}
                checked={selectedOption === radioValue.CUSTOM}
              />
            </div>
          )}
          {selectedOption === radioValue.CUSTOM ? (
            <form className="ReceiverInviteMessage__form">
              <Textarea
                fieldSize="sm"
                id="textarea-custom-input"
                rows={5}
                placeholder={customMessagePlaceholder}
                value={customMessageInput}
                onChange={(event) => {
                  updateMessage(event.target.value);
                }}
              ></Textarea>
            </form>
          ) : (
            <div className="ReceiverInviteMessage__form">
              <Textarea
                fieldSize="sm"
                id="textarea-standard"
                disabled
                rows={5}
                value={
                  isEditMessage
                    ? organization.data.smsRegistrationMessageTemplate ??
                      standardOrgMessage
                    : draftMessage ??
                      organization.data.smsRegistrationMessageTemplate ??
                      standardOrgMessage
                }
              ></Textarea>
            </div>
          )}
        </div>
      </Card>
    </>
  );
};
