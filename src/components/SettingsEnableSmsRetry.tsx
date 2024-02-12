import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Input,
  Notification,
  Toggle,
  Loader,
} from "@stellar/design-system";
import { useDispatch } from "react-redux";

import { DropdownMenu } from "components/DropdownMenu";
import { MoreMenuButton } from "components/MoreMenuButton";
import { ErrorWithExtras } from "components/ErrorWithExtras";

import { useUpdateOrgSmsRetryInterval } from "apiQueries/useUpdateOrgSmsRetryInterval";
import { useRedux } from "hooks/useRedux";
import { AppDispatch } from "store";
import { getOrgInfoAction } from "store/ducks/organization";

export const SettingsEnableSmsRetry = () => {
  const { organization } = useRedux("organization");

  const [smsRetryInterval, setSmsRetryInterval] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const dispatch: AppDispatch = useDispatch();

  const { mutateAsync, isLoading, error, isSuccess } =
    useUpdateOrgSmsRetryInterval();

  useEffect(() => {
    setSmsRetryInterval(organization.data.smsResendInterval);
  }, [organization.data.smsResendInterval]);

  useEffect(() => {
    if (isSuccess) {
      dispatch(getOrgInfoAction());
      setIsEditMode(false);
    }
  }, [dispatch, isSuccess]);

  const handleToggleChange = () => {
    // Default interval is 2 days
    mutateAsync(organization.data.smsResendInterval === 0 ? 2 : 0);
  };

  const handleSmsRetrySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (smsRetryInterval) {
      mutateAsync(smsRetryInterval);
    }
  };

  const handleSmsRetryReset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsEditMode(false);
    setSmsRetryInterval(organization.data.smsResendInterval);
  };

  const renderContent = () => {
    return (
      <div className="SdpSettings">
        <div className="SdpSettings__row">
          <div className="SdpSettings__item">
            <label className="SdpSettings__label" htmlFor="sms-retry">
              Enable automatic SMS retry
            </label>
            <div className="Toggle__wrapper">
              {isLoading ? <Loader size="1rem" /> : null}
              <Toggle
                id="sms-retry"
                checked={Boolean(organization.data.smsResendInterval)}
                onChange={handleToggleChange}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="Note">
            Select this option to automatically re-send the SMS invitation to
            unregistered receivers after a certain time period. They will
            receive the same message again. The message will only go to
            receivers who have not registered their wallet.
          </div>
        </div>

        {organization.data.smsResendInterval ? (
          <div className="SdpSettings__row">
            <form
              className="SdpSettings__form"
              onSubmit={handleSmsRetrySubmit}
              onReset={handleSmsRetryReset}
            >
              <div className="SdpSettings__form__row">
                <Input
                  fieldSize="sm"
                  id="sms-retry-interval"
                  label="SMS retry interval (days)"
                  type="number"
                  value={smsRetryInterval ?? ""}
                  onChange={(e) => {
                    e.target.value !== ""
                      ? setSmsRetryInterval(Number(e.target.value))
                      : setSmsRetryInterval(null);
                  }}
                  disabled={!isEditMode}
                  error={
                    smsRetryInterval == 0 ? "Retry interval cannot be 0" : ""
                  }
                />
                {!isEditMode ? (
                  <DropdownMenu triggerEl={<MoreMenuButton />}>
                    <DropdownMenu.Item onClick={() => setIsEditMode(true)}>
                      Edit
                    </DropdownMenu.Item>
                  </DropdownMenu>
                ) : null}
              </div>
              {isEditMode ? (
                <div className="SdpSettings__form__buttons">
                  <Button
                    variant="secondary"
                    size="xs"
                    type="reset"
                    isLoading={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="xs"
                    type="submit"
                    isLoading={isLoading}
                    disabled={
                      !smsRetryInterval ||
                      smsRetryInterval === organization.data.smsResendInterval
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
