import { Card, Loader, Notification, Toggle } from "@stellar/design-system";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { ErrorWithExtras } from "@/components/ErrorWithExtras";

import { useUpdateOrgMfaEnabled } from "@/apiQueries/useUpdateOrgMFAEnabled";
import { useRedux } from "@/hooks/useRedux";
import { AppDispatch } from "@/store";
import { getOrgInfoAction } from "@/store/ducks/organization";

export const SettingsEnableMfa = () => {
  const { organization } = useRedux("organization");

  const dispatch: AppDispatch = useDispatch();

  const { mutateAsync, isPending, error, isSuccess } = useUpdateOrgMfaEnabled();

  useEffect(() => {
    if (isSuccess) {
      dispatch(getOrgInfoAction());
    }
  }, [dispatch, isSuccess]);

  const handleToggleChange = () => {
    mutateAsync(!organization.data.mfa_disabled);
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
    </>
  );
};
