import { useState } from "react";
import { Button, Card, RadioButton, Textarea } from "@stellar/design-system";
import { InfoTooltip } from "components/InfoTooltip";
import "./styles.scss";

export const ReceiverInviteMessage = () => {
  enum radioValue {
    STANDARD = "standard",
    CUSTOM = "custom",
  }

  const PLACEHOLDER_MESSAGE =
    "Input your message here in the appropriate language. Make sure to say which organization the transaction is coming from. Keep your message short. A link to the wallet will be appended at the end.";

  // TODO: get custom message from API if it's set, otherwise use default
  // TODO: hard-code the default message or fetch from API
  // TODO: select message option on load (custom or default)
  // TODO: handle success and error states
  // TODO: check with other roles

  const [selectedOption, setSelectedOption] = useState(radioValue.STANDARD);
  const [isEditMessage, setIsEditMessage] = useState(false);

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(
      event.target.value === radioValue.CUSTOM
        ? radioValue.CUSTOM
        : radioValue.STANDARD,
    );
  };

  const handleSubmitMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert("TODO: submit");
  };

  const renderCustomMessage = () => {
    if (isEditMessage) {
      return (
        <form
          onSubmit={handleSubmitMessage}
          onReset={() => setIsEditMessage(false)}
          className="ReceiverInviteMessage__form"
        >
          <Textarea
            fieldSize="sm"
            id="textarea-custom-input"
            rows={5}
            value={PLACEHOLDER_MESSAGE}
          ></Textarea>
          <div className="ReceiverInviteMessage__form__buttons">
            <Button variant="secondary" size="xs" type="reset">
              Cancel
            </Button>
            <Button variant="primary" size="xs" type="submit">
              Confirm
            </Button>
          </div>
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
          value={PLACEHOLDER_MESSAGE}
        ></Textarea>
        <div className="ReceiverInviteMessage__form__buttons">
          <Button
            variant="primary"
            size="xs"
            onClick={() => setIsEditMessage(true)}
          >
            Edit message
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <div className="CardStack__card ReceiverInviteMessage">
        <div className="CardStack__title">
          <InfoTooltip infoText="TODO: wallet invite info text">
            Customize receiver wallet invite
          </InfoTooltip>
        </div>

        <div className="Note">
          You can use a standard message or customized text to invite your
          receivers to set up a wallet and receive funds. This is the first
          message they receive from your organization. It contains a link to the
          appropriate wallet at the end of the message. Please check all values
          for accuracy. New disbursements use the text set here.
        </div>

        <div className="ReceiverInviteMessage__options">
          <RadioButton
            id="msg-std"
            name="receiver-message"
            label="Standard message"
            fieldSize="xs"
            value={radioValue.STANDARD}
            onChange={handleOptionChange}
            checked={selectedOption === radioValue.STANDARD}
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
          <Textarea
            fieldSize="sm"
            id="textarea-standard"
            disabled
            rows={5}
            value="TODO: get default message"
          ></Textarea>
        )}
      </div>
    </Card>
  );
};
