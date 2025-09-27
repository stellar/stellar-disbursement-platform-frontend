import { Card, Loader, Notification, Toggle } from "@stellar/design-system";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { useUpdateOrgCaptchaDisabled } from "@/apiQueries/useUpdateOrgCaptchaDisabled";
import { ErrorWithExtras } from "@/components/ErrorWithExtras";
import { useRedux } from "@/hooks/useRedux";
import { AppDispatch } from "@/store";
import { getOrgInfoAction } from "@/store/ducks/organization";

export const SettingsDisableCaptcha = () => {
  const { organization } = useRedux("organization");

  const dispatch: AppDispatch = useDispatch();

  const { mutateAsync, isPending, error, isSuccess } = useUpdateOrgCaptchaDisabled();

  useEffect(() => {
    if (isSuccess) {
      dispatch(getOrgInfoAction());
    }
  }, [dispatch, isSuccess]);

  const handleToggleChange = () => {
    mutateAsync(!organization.data.captcha_disabled);
  };

  const renderContent = () => {
    return (
      <div className="SdpSettings">
        <div className="SdpSettings__row">
          <div className="SdpSettings__item">
            <label className="SdpSettings__label" htmlFor="captcha-disabled">
              Disable reCAPTCHA
            </label>
            <div className="Toggle__wrapper">
              {isPending ? <Loader size="1rem" /> : null}
              <Toggle
                id="captcha-disabled"
                checked={Boolean(organization.data.captcha_disabled)}
                onChange={handleToggleChange}
                disabled={isPending}
                fieldSize="sm"
              />
            </div>
          </div>
          <div className="Note">
            Toggle this option to disable reCAPTCHA verification on login and MFA pages. When
            disabled, this organization will not require reCAPTCHA verification and will use the
            platform default setting.
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
