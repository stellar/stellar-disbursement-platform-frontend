import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  Notification,
  RadioButton,
  Textarea,
} from "@stellar/design-system";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";

import { NotificationWithButtons } from "components/NotificationWithButtons";
import { useUpdateSmsTemplate } from "apiQueries/useUpdateOrgSmsTemplate";
import { useRedux } from "hooks/useRedux";
import { AppDispatch } from "store";
import { getOrgInfoAction } from "store/ducks/organization";

import "./styles.scss";

export const ReceiverInviteMessage = () => {
  enum radioValue {
    STANDARD = "standard",
    CUSTOM = "custom",
  }

  const DEFAULT_MESSAGE =
    "You have a payment waiting for you from the {{.OrganizationName}}. Click {{.RegistrationLink}} to register.";
  const PLACEHOLDER_MESSAGE =
    "Input your message here in the appropriate language. Make sure to say which organization the transaction is coming from. Keep your message short. A link to the wallet will be appended at the end.";

  const { organization } = useRedux("organization");
  const dispatch: AppDispatch = useDispatch();

  const [selectedOption, setSelectedOption] = useState(radioValue.STANDARD);
  const [isEditMessage, setIsEditMessage] = useState(false);
  const [customMessageInput, setCustomMessageInput] = useState("");

  const customMessage =
    organization.data.smsRegistrationMessageTemplate ?? PLACEHOLDER_MESSAGE;

  const { isFetching, data, isError, isSuccess, error, refetch } =
    useUpdateSmsTemplate(customMessageInput);
  const queryClient = useQueryClient();

  const resetQuery = useCallback(() => {
    queryClient.resetQueries({
      queryKey: ["organization", "smsRegistrationMessageTemplate"],
      exact: true,
    });
  }, [queryClient]);

  // Pre-select option when page loads
  useEffect(() => {
    setSelectedOption(
      organization.data.smsRegistrationMessageTemplate
        ? radioValue.CUSTOM
        : radioValue.STANDARD,
    );
  }, [
    organization.data.smsRegistrationMessageTemplate,
    radioValue.CUSTOM,
    radioValue.STANDARD,
  ]);

  // Clear error or success message when component unmounts
  useEffect(() => {
    return () => {
      if (isError || isSuccess) {
        resetQuery();
      }
    };
  }, [isError, isSuccess, resetQuery]);

  // On success, re-fetch org info and close edit form
  useEffect(() => {
    if (isSuccess) {
      dispatch(getOrgInfoAction());
      setIsEditMessage(false);
    }
  }, [dispatch, isSuccess]);

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(
      event.target.value === radioValue.CUSTOM
        ? radioValue.CUSTOM
        : radioValue.STANDARD,
    );
    setIsEditMessage(false);
    setCustomMessageInput("");

    if (error) {
      resetQuery();
    }
  };

  const handleSubmitMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isError || isSuccess) {
      resetQuery();
    }

    refetch();
  };

  const handleResetMessage = () => {
    refetch();
  };

  const renderCustomMessage = () => {
    if (isEditMessage) {
      return (
        <form
          onSubmit={handleSubmitMessage}
          onReset={() => {
            setIsEditMessage(false);
            setCustomMessageInput("");
            resetQuery();
          }}
          className="ReceiverInviteMessage__form"
        >
          <Textarea
            fieldSize="sm"
            id="textarea-custom-input"
            rows={5}
            value={customMessageInput}
            onChange={(event) => setCustomMessageInput(event.target.value)}
            disabled={isFetching}
          ></Textarea>
          <div className="ReceiverInviteMessage__form__buttons">
            <Button
              variant="secondary"
              size="xs"
              type="reset"
              isLoading={isFetching}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="xs"
              type="submit"
              isLoading={isFetching}
              disabled={customMessageInput === customMessage}
            >
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
          value={customMessage}
        ></Textarea>
        <div className="ReceiverInviteMessage__form__buttons">
          <Button
            variant="primary"
            size="xs"
            onClick={() => {
              setIsEditMessage(true);
              setCustomMessageInput(customMessage);
            }}
          >
            Edit message
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      {isError ? (
        <Notification variant="error" title="Error">
          {error.message}
        </Notification>
      ) : null}

      {isSuccess ? (
        <NotificationWithButtons
          variant="success"
          title="Success"
          buttons={[
            {
              label: "Dismiss",
              onClick: () => {
                resetQuery();
              },
            },
          ]}
        >
          {data.message}
        </NotificationWithButtons>
      ) : null}

      <Card>
        <div className="CardStack__card ReceiverInviteMessage">
          <div className="CardStack__title">
            Customize receiver wallet invite
          </div>

          <div className="Note">
            You can use a standard message or customized text to invite your
            receivers to set up a wallet and receive funds. This is the first
            message they receive from your organization. It contains a link to
            the appropriate wallet at the end of the message. Please check all
            values for accuracy. New disbursements use the text set here.
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
            <div className="ReceiverInviteMessage__form">
              <Textarea
                fieldSize="sm"
                id="textarea-standard"
                disabled
                rows={5}
                value={DEFAULT_MESSAGE}
              ></Textarea>

              {organization.data.smsRegistrationMessageTemplate ? (
                <div className="ReceiverInviteMessage__form__buttons">
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={handleResetMessage}
                    isLoading={isFetching}
                  >
                    Reset message
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </Card>
    </>
  );
};
