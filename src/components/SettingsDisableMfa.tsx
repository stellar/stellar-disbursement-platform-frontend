import { useEffect, useState } from "react";

import { useDispatch } from "react-redux";

import { Button, Card, Loader, Modal, Notification, Toggle } from "@stellar/design-system";

import { ErrorWithExtras } from "@/components/ErrorWithExtras";

import { getOrgInfoAction } from "@/store/ducks/organization";

import { useUpdateOrgMfaDisabled } from "@/apiQueries/useUpdateOrgMfaDisabled";

import { useRedux } from "@/hooks/useRedux";

import { AppDispatch } from "@/store";


export const SettingsDisableMfa = () => {
  const { organization } = useRedux("organization");

  const dispatch: AppDispatch = useDispatch();

  const { mutateAsync, isPending, error, isSuccess } = useUpdateOrgMfaDisabled();

  // Only the "enable MFA" direction (turning this toggle OFF) risks a login lockout — it
  // requires every user's email address to actually receive the verification code. Confirm
  // that explicitly before it takes effect; turning MFA back off needs no extra step.
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      dispatch(getOrgInfoAction());
    }
  }, [dispatch, isSuccess]);

  const handleToggleChange = () => {
    const isCurrentlyDisabled = Boolean(organization.data.mfa_disabled);

    if (isCurrentlyDisabled) {
      // About to enable MFA — confirm the email-deliverability risk first.
      setIsConfirmVisible(true);
      return;
    }

    mutateAsync(!isCurrentlyDisabled);
  };

  const handleConfirmEnableMfa = () => {
    setIsConfirmVisible(false);
    mutateAsync(false);
  };

  const renderContent = () => {
    return (
      <div className="SdpSettings">
        <div className="SdpSettings__row">
          <div className="SdpSettings__item">
            <label className="SdpSettings__label" htmlFor="mfa-disabled">
              Disable Multi-Factor Authentication (MFA)
            </label>
            <div className="Toggle__wrapper">
              {isPending ? <Loader size="1rem" /> : null}
              <Toggle
                id="mfa-disabled"
                checked={Boolean(organization.data.mfa_disabled)}
                onChange={handleToggleChange}
                disabled={isPending}
                fieldSize="sm"
              />
            </div>
          </div>
          <div className="Note">
            Toggle this option to disable Multi-Factor Authentication for user logins. When
            disabled, users will not need to enter a verification code and this organization will
            use the platform default setting.
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {error ? (
        <Notification variant="error" title="Error" isFilled={true}>
          <ErrorWithExtras appError={error} />
        </Notification>
      ) : null}

      <Card>
        <div className="CardStack__card">{renderContent()}</div>
      </Card>

      <Modal visible={isConfirmVisible} onClose={() => setIsConfirmVisible(false)}>
        <Modal.Heading>Enable Multi-Factor Authentication?</Modal.Heading>
        <Modal.Body>
          <Notification
            variant="warning"
            title="Make sure your users can receive email first"
            isFilled={true}
          >
            Enabling MFA requires all users to receive a verification code by email. Make sure your
            users&rsquo; email addresses can actually receive mail before enabling this, or you may
            be locked out of your account.
          </Notification>
        </Modal.Body>
        <Modal.Footer>
          <Button
            size="md"
            variant="tertiary"
            onClick={() => setIsConfirmVisible(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            size="md"
            variant="primary"
            onClick={handleConfirmEnableMfa}
            isLoading={isPending}
          >
            Enable MFA
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
