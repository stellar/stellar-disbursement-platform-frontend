import { Fragment, useEffect, useState } from "react";
import {
  Card,
  RadioButton,
  Textarea,
} from "@stellar/design-system";
import { useDispatch } from "react-redux";

import { useRedux } from "hooks/useRedux";
import { AppDispatch } from "store";
import { getOrgInfoAction } from "store/ducks/organization";

import "./styles.scss";

interface DisbursementInviteMessageProps {
  disbursementInviteMessage: string;
  isEditMessage: boolean;
}

export const DisbursementInviteMessage = ({disbursementInviteMessage, isEditMessage} : DisbursementInviteMessageProps) => {
  enum radioValue {
    ORGANIZATION = "organization",
    CUSTOM = "custom",
  }

  const customMessagePlaceholder =
    "Input your registration invitation message for this disbursement here in the appropriate language. Make sure to say which organization the transaction is coming from. Keep your message short. A link to the wallet will be appended at the end.";

  const { organization } = useRedux("organization");
  const dispatch: AppDispatch = useDispatch();

  const [selectedOption, setSelectedOption] = useState(radioValue.ORGANIZATION);
  const [customMessageInput, setCustomMessageInput] = useState(disbursementInviteMessage);
  
  useEffect(() => {
      dispatch(getOrgInfoAction());
  }, [dispatch]);

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === radioValue.ORGANIZATION) {
      setCustomMessageInput("");
      setSelectedOption(radioValue.ORGANIZATION);
    } else {
      setSelectedOption(radioValue.CUSTOM);
    }
  };

  const renderCustomMessage = () => {
    if (isEditMessage) {
      return (
        <form
          className="ReceiverInviteMessage__form"
        >
          <Textarea
            fieldSize="sm"
            id="textarea-custom-input"
            rows={5}
            value={customMessageInput}
            onChange={(event) => {
              setCustomMessageInput(event.target.value);
            }}
          ></Textarea>
        </form>
      );
    }

    return (
      <div className="ReceiverInviteMessage__form">
        <Textarea
          fieldSize="sm"
          id="textarea-custom"
          disabled
          rows={5}
          value={customMessagePlaceholder}
        ></Textarea>
      </div>
    );
  };

  return (
    <>
      <Card>
        <div className="CardStack__card ReceiverInviteMessage">
          <div className="CardStack__title">
            Customize invite
          </div>

          <div className="Note">
            You can use the organization default message or customized text to invite your receivers to set up a wallet and receive funds for this disbursement. It contains a link to the appropriate wallet at the end of the message. Please check all values for accuracy.
          </div>

          <div className="ReceiverInviteMessage__options">
            <RadioButton
              id="msg-std"
              name="receiver-message"
              label={
                <Fragment key="msg-std-label">
                  {"Default message"}{" "}
                </Fragment>
              }
              fieldSize="xs"
              value={radioValue.ORGANIZATION}
              onChange={handleOptionChange}
              checked={selectedOption === radioValue.ORGANIZATION}
            />
            <RadioButton
              id="msg-cst"
              name="receiver-message"
              label="Custom message"
              fieldSize="xs"
              value={radioValue.CUSTOM}
              onChange={handleOptionChange}
              checked={selectedOption === radioValue.CUSTOM}
            />
          </div>

          {selectedOption === radioValue.CUSTOM ? (
            renderCustomMessage()
          ) : (
            <div className="ReceiverInviteMessage__form">
              <Textarea
                fieldSize="sm"
                id="textarea-standard"
                disabled
                rows={5}
                value={organization.data.smsRegistrationMessageTemplate}
              ></Textarea>
            </div>
          )}
        </div>
      </Card>
    </>
  );
};
