import { Fragment, useEffect, useState } from "react";
import {
  Button,
  Card,
  Input,
  Loader,
  Notification,
  RadioButton,
  Textarea,
} from "@stellar/design-system";
import { useDispatch } from "react-redux";

import { NotificationWithButtons } from "components/NotificationWithButtons";
import { ErrorWithExtras } from "components/ErrorWithExtras";
import { useUpdateOrgHTMLEmailTemplate } from "apiQueries/useUpdateOrgHTMLEmailTemplate";
import { useRedux } from "hooks/useRedux";
import { AppDispatch } from "store";
import { getOrgInfoAction } from "store/ducks/organization";

import "./styles.scss";

export const ReceiverInviteHTMLEmailTemplate = () => {
  enum radioValue {
    DEFAULT = "default",
    CUSTOM = "custom",
  }

  const PLACEHOLDER_TEMPLATE = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      {{EmailStyle}}
    </head>
    <body>
      <p>You have a payment waiting for you from the {{.OrganizationName}}. Click <a href="{{.RegistrationLink}}">here</a> to register.</p>
    </body>
    </html>`.trim();
  const PLACEHOLDER_SUBJECT = "You have a payment waiting for you from the {{.OrganizationName}}";

  const { organization } = useRedux("organization");
  const dispatch: AppDispatch = useDispatch();

  const [selectedOption, setSelectedOption] = useState(radioValue.DEFAULT);
  const [isEditTemplate, setIsEditTemplate] = useState(false);
  const [customTemplateInput, setCustomTemplateInput] = useState("");
  const [customSubjectInput, setCustomSubjectInput] = useState("");

  const customTemplate =
    organization.data.receiverRegistrationHTMLEmailTemplate ?? PLACEHOLDER_TEMPLATE;

  const customSubject =
    organization.data.receiverRegistrationHTMLEmailSubject ?? PLACEHOLDER_SUBJECT;

  const { isPending, data, isError, isSuccess, error, mutateAsync, reset } =
    useUpdateOrgHTMLEmailTemplate();

  // Pre-select option when page loads
  useEffect(() => {
    setSelectedOption(
      organization.data.receiverRegistrationHTMLEmailTemplate
        ? radioValue.CUSTOM
        : radioValue.DEFAULT,
    );
  }, [
    organization.data.receiverRegistrationHTMLEmailTemplate,
    radioValue.CUSTOM,
    radioValue.DEFAULT,
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
      setIsEditTemplate(false);
    }
  }, [dispatch, isSuccess]);

  const resetToDefault = () => {
    setIsEditTemplate(false);
    setCustomTemplateInput("");
    setCustomSubjectInput("");
    setSelectedOption(radioValue.DEFAULT);
  };

  const handleOptionChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isPending) return;

    if (isError || isSuccess) {
      await reset();
    }

    if (event.target.value === radioValue.DEFAULT) {
      if (organization.data.receiverRegistrationHTMLEmailTemplate) {
        try {
          await mutateAsync({ template: "", subject: "" });
          resetToDefault();
        } catch {
          // Error handled by hook, don't update UI
        }
      } else {
        resetToDefault();
      }
    } else {
      setSelectedOption(radioValue.CUSTOM);
    }
  };

  const handleSubmitTemplate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!customTemplateInput.trim()) return;

    try {
      await mutateAsync({
        template: customTemplateInput.trim(),
        subject: customSubjectInput.trim(),
      });
    } catch {
      // Error handled by hook, don't update UI
    }
  };

  const renderCustomTemplate = () => {
    if (isEditTemplate) {
      return (
        <form
          onSubmit={handleSubmitTemplate}
          onReset={() => {
            setIsEditTemplate(false);
            setCustomTemplateInput("");
            setCustomSubjectInput("");
            reset();
          }}
          className="ReceiverInviteHTMLEmailTemplate__form"
        >
          <Input
            id="html-email-subject-input"
            label="Email Subject"
            fieldSize="sm"
            placeholder={PLACEHOLDER_SUBJECT}
            value={customSubjectInput}
            onChange={(e) => setCustomSubjectInput(e.target.value)}
            disabled={isPending}
            note="Available variables: {{.OrganizationName}}"
          />

          <Textarea
            id="html-email-template-input"
            label="HTML Email Template"
            fieldSize="sm"
            placeholder={PLACEHOLDER_TEMPLATE}
            value={customTemplateInput}
            onChange={(e) => setCustomTemplateInput(e.target.value)}
            rows={15}
            disabled={isPending}
            note="Available variables: {{.OrganizationName}} and {{.RegistrationLink}}."
          />

          <div className="ReceiverInviteHTMLEmailTemplate__form__buttons">
            <Button variant="secondary" size="xs" type="reset" disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="xs"
              type="submit"
              isLoading={isPending}
              disabled={!customTemplateInput.trim()}
            >
              Confirm
            </Button>
          </div>
        </form>
      );
    }

    return (
      <div className="ReceiverInviteHTMLEmailTemplate__form">
        <Input
          id="html-email-subject-display"
          label="Email Subject"
          fieldSize="sm"
          value={customSubject}
          disabled
        />

        <Textarea
          fieldSize="sm"
          id="html-email-template-display"
          label="HTML Email Template"
          disabled
          rows={15}
          value={customTemplate}
        />
        <div className="ReceiverInviteHTMLEmailTemplate__form__buttons">
          <Button
            variant="primary"
            size="xs"
            onClick={() => {
              setIsEditTemplate(true);
              setCustomTemplateInput(customTemplate);
              setCustomSubjectInput(customSubject);
            }}
          >
            Edit template
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
        <div className="CardStack__card ReceiverInviteHTMLEmailTemplate">
          <div className="CardStack__title">Customize receiver wallet HTML email template</div>

          <div className="Note">
            Customize the HTML email template that will be sent to receivers when they need to
            register their wallet to receive a payment. The HTML template is only used for email
            invitations. SMS invitations will continue to use the plain text template.
          </div>

          <div className="ReceiverInviteHTMLEmailTemplate__options">
            <RadioButton
              id="html-email-template-standard"
              name="html-email-template"
              label={
                <Fragment key="html-email-template-standard-label">
                  {"Standard HTML email template"}{" "}
                  {selectedOption === radioValue.DEFAULT && isPending ? (
                    <Loader size="1.25rem" />
                  ) : null}
                </Fragment>
              }
              fieldSize="xs"
              value={radioValue.DEFAULT}
              checked={selectedOption === radioValue.DEFAULT}
              onChange={handleOptionChange}
              disabled={isPending}
            />
            <RadioButton
              id="html-email-template-custom"
              name="html-email-template"
              label="Custom HTML email template"
              fieldSize="xs"
              value={radioValue.CUSTOM}
              checked={selectedOption === radioValue.CUSTOM}
              onChange={handleOptionChange}
              disabled={isPending}
            />
          </div>

          {selectedOption === radioValue.CUSTOM ? (
            renderCustomTemplate()
          ) : (
            <div className="ReceiverInviteHTMLEmailTemplate__form">
              <Textarea
                fieldSize="sm"
                id="html-email-template-standard"
                disabled
                rows={5}
                value="Uses the default styled HTML email template with your organization branding."
                note="Standard template with {{.OrganizationName}} and {{.RegistrationLink}} variables."
              />
            </div>
          )}
        </div>
      </Card>
    </>
  );
};
