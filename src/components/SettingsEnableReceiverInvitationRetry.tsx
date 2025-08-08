import { useEffect, useState } from "react";
import { Button, Card, Input, Notification, Toggle, Loader } from "@stellar/design-system";
import { useDispatch } from "react-redux";

import { DropdownMenu } from "components/DropdownMenu";
import { MoreMenuButton } from "components/MoreMenuButton";
import { ErrorWithExtras } from "components/ErrorWithExtras";

import { useUpdateOrgInvitationRetryInterval } from "apiQueries/useUpdateOrgInvitationRetryInterval";
import { useRedux } from "hooks/useRedux";
import { AppDispatch } from "store";
import { getOrgInfoAction } from "store/ducks/organization";

export const SettingsEnableReceiverInvitationRetry = () => {
  const { organization } = useRedux("organization");

  const [receiverInvitationRetryInterval, setReceiverInvitationRetryInterval] = useState<
    number | null
  >(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const dispatch: AppDispatch = useDispatch();

  const { mutateAsync, isPending, error, isSuccess } = useUpdateOrgInvitationRetryInterval();

  useEffect(() => {
    setReceiverInvitationRetryInterval(organization.data.receiverInvitationResendInterval);
  }, [organization.data.receiverInvitationResendInterval]);

  useEffect(() => {
    if (isSuccess) {
      dispatch(getOrgInfoAction());
      setIsEditMode(false);
    }
  }, [dispatch, isSuccess]);

  const handleToggleChange = () => {
    // Default interval is 2 days
    mutateAsync(organization.data.receiverInvitationResendInterval === 0 ? 2 : 0);
  };

  const handleInvitationRetrySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (receiverInvitationRetryInterval) {
      mutateAsync(receiverInvitationRetryInterval);
    }
  };

  const handleInvitationRetryReset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsEditMode(false);
    setReceiverInvitationRetryInterval(organization.data.receiverInvitationResendInterval);
  };

  const renderContent = () => {
    return (
      <div className="SdpSettings">
        <div className="SdpSettings__row">
          <div className="SdpSettings__item">
            <label className="SdpSettings__label" htmlFor="receiver-invitation-retry">
              Enable automatic message retry
            </label>
            <div className="Toggle__wrapper">
              {isPending ? <Loader size="1rem" /> : null}
              <Toggle
                id="receiver-invitation-retry"
                checked={Boolean(organization.data.receiverInvitationResendInterval)}
                onChange={handleToggleChange}
                disabled={isPending}
                fieldSize="sm"
              />
            </div>
          </div>
          <div className="Note">
            Select this option to automatically re-send the invitation message to unregistered
            receivers after a certain time period. They will receive the same message again. The
            message will only go to receivers who have not registered their wallet.
          </div>
        </div>

        {organization.data.receiverInvitationResendInterval ? (
          <div className="SdpSettings__row">
            <form
              className="SdpSettings__form"
              onSubmit={handleInvitationRetrySubmit}
              onReset={handleInvitationRetryReset}
            >
              <div className="SdpSettings__form__row">
                <Input
                  fieldSize="sm"
                  id="receiver-invitation-retry-interval"
                  label="Receiver invitation retry interval (days)"
                  type="number"
                  value={receiverInvitationRetryInterval ?? ""}
                  onChange={(e) => {
                    if (e.target.value !== "") {
                      setReceiverInvitationRetryInterval(Number(e.target.value));
                    } else {
                      setReceiverInvitationRetryInterval(null);
                    }
                  }}
                  disabled={!isEditMode}
                  error={receiverInvitationRetryInterval == 0 ? "Retry interval cannot be 0" : ""}
                />
                {!isEditMode ? (
                  <DropdownMenu triggerEl={<MoreMenuButton />}>
                    <DropdownMenu.Item onClick={() => setIsEditMode(true)}>Edit</DropdownMenu.Item>
                  </DropdownMenu>
                ) : null}
              </div>
              {isEditMode ? (
                <div className="SdpSettings__form__buttons">
                  <Button variant="tertiary" size="sm" type="reset" isLoading={isPending}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    isLoading={isPending}
                    disabled={
                      !receiverInvitationRetryInterval ||
                      receiverInvitationRetryInterval ===
                        organization.data.receiverInvitationResendInterval
                    }
                  >
                    Update
                  </Button>
                </div>
              ) : null}
            </form>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <>
      {error ? (
        <Notification variant="error" title="Error">
          <ErrorWithExtras appError={error} />
        </Notification>
      ) : null}

      <Card>
        <div className="CardStack__card">{renderContent()}</div>
      </Card>
    </>
  );
};
