import { useEffect } from "react";
import { Card, Notification, Toggle, Loader } from "@stellar/design-system";
import { useDispatch } from "react-redux";

import { ErrorWithExtras } from "@/components/ErrorWithExtras";

import { useUpdateOrgMFAEnabled } from "@/apiQueries/useUpdateOrgMFAEnabled";
import { useRedux } from "@/hooks/useRedux";
import { AppDispatch } from "@/store";
import { getOrgInfoAction } from "@/store/ducks/organization";

export const SettingsEnableMFA = () => {
  const { organization } = useRedux("organization");

  const dispatch: AppDispatch = useDispatch();

  const { mutateAsync, isPending, error, isSuccess } = useUpdateOrgMFAEnabled();

  useEffect(() => {
    if (isSuccess) {
      dispatch(getOrgInfoAction());
    }
  }, [dispatch, isSuccess]);

  const handleToggleChange = () => {
    mutateAsync(!organization.data.mfa_enabled);
  };

  const renderContent = () => {
    return (
      <div className="SdpSettings">
        <div className="SdpSettings__row">
          <div className="SdpSettings__item">
            <label className="SdpSettings__label" htmlFor="mfa-enabled">
              Enable Multi-Factor Authentication (MFA)
            </label>
            <div className="Toggle__wrapper">
              {isPending ? <Loader size="1rem" /> : null}
              <Toggle
                id="mfa-enabled"
                checked={Boolean(organization.data.mfa_enabled)}
                onChange={handleToggleChange}
                disabled={isPending}
                fieldSize="sm"
              />
            </div>
          </div>
          <div className="Note">
            Select this option to require Multi-Factor Authentication for user logins. When enabled,
            users will need to enter a verification code sent to their email in addition to their
            password. If disabled, this organization will use the platform default setting.
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
    </>
  );
};
