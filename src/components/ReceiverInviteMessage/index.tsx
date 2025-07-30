import { Fragment, useEffect, useState } from "react";
import { Button, Card, Loader, Notification, RadioButton, Textarea } from "@stellar/design-system";
import { useDispatch } from "react-redux";

import { NotificationWithButtons } from "components/NotificationWithButtons";
import { ErrorWithExtras } from "components/ErrorWithExtras";
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
    organization.data.receiverRegistrationMessageTemplate ?? PLACEHOLDER_MESSAGE;

  const { isPending, data, isError, isSuccess, error, mutateAsync, reset } = useUpdateSmsTemplate();

  // Pre-select option when page loads
  useEffect(() => {
    setSelectedOption(
      organization.data.receiverRegistrationMessageTemplate
        ? radioValue.CUSTOM
        : radioValue.STANDARD,
    );
  }, [
    organization.data.receiverRegistrationMessageTemplate,
    radioValue.CUSTOM,
    radioValue.STANDARD,
  ]);

  // Clear error or success message when component unmounts
  useEffect(() => {
    return () => {
      if (isError || isSuccess) {
        reset();
      }
    };
  }, [isError, isSuccess, reset]);

  // On success, re-fetch org info and close edit form
  useEffect(() => {
    if (isSuccess) {
      dispatch(getOrgInfoAction());
      setIsEditMessage(false);
    }
  }, [dispatch, isSuccess]);

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isPending) {
      return;
    }

    if (isError || isSuccess) {
      reset();
    }

    // Adding little delay to make sure reset is done
    const t = setTimeout(() => {
      if (event.target.value === radioValue.STANDARD) {
        if (organization.data.receiverRegistrationMessageTemplate) {
          mutateAsync("");
        }

        setIsEditMessage(false);
        setCustomMessageInput("");
        setSelectedOption(radioValue.STANDARD);
      } else {
        setSelectedOption(radioValue.CUSTOM);
      }

      clearTimeout(t);
    }, 100);
  };

  const handleSubmitMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutateAsync(customMessageInput);
  };

  const renderCustomMessage = () => {
    if (isEditMessage) {
      return (
        <form
          onSubmit={handleSubmitMessage}
          onReset={() => {
            setIsEditMessage(false);
            setCustomMessageInput("");
            reset();
          }}
          className="ReceiverInviteMessage__form"
        >
          <Textarea
            fieldSize="sm"
            id="textarea-custom-input"
            rows={5}
            value={customMessageInput}
            onChange={(event) => {
              if (isError || isSuccess) {
                reset();
              }

              setCustomMessageInput(event.target.value);
            }}
            disabled={isPending}
          ></Textarea>
          <div className="ReceiverInviteMessage__form__buttons">
            <Button variant="tertiary" size="sm" type="reset" isLoading={isPending}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isPending}
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
            size="sm"
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
          <ErrorWithExtras appError={error} />
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
                reset();
              },
            },
          ]}
        >
          {data.message}
        </NotificationWithButtons>
      ) : null}

      <Card>
        <div className="CardStack__card ReceiverInviteMessage">
          <div className="CardStack__title">Customize receiver wallet invite</div>

          <div className="Note">
            You can use a standard message or customized text to invite your receivers to set up a
            wallet and receive funds. This is the first message they receive from your organization.
            It contains a link to the appropriate wallet at the end of the message. Please check all
            values for accuracy. New disbursements use the text set here.
          </div>

          <div className="ReceiverInviteMessage__options">
            <RadioButton
              id="msg-std"
              name="receiver-message"
              label={
                <Fragment key="msg-std-label">
                  {"Standard message"}{" "}
                  {selectedOption === radioValue.STANDARD && isPending ? (
                    <Loader size="1.25rem" />
                  ) : null}
                </Fragment>
              }
              fieldSize="sm"
              value={radioValue.STANDARD}
              onChange={handleOptionChange}
              checked={selectedOption === radioValue.STANDARD}
              disabled={isPending}
            />
            <RadioButton
              id="msg-cst"
              name="receiver-message"
              label="Custom message"
              fieldSize="sm"
              value={radioValue.CUSTOM}
              onChange={handleOptionChange}
              checked={selectedOption === radioValue.CUSTOM}
              disabled={isPending}
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
            </div>
          )}
        </div>
      </Card>
    </>
  );
};
