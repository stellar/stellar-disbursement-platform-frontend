import { useEffect } from "react";
import { Card, Notification, Toggle, Loader } from "@stellar/design-system";
import { useDispatch } from "react-redux";

import { API_URL } from "constants/envVariables";
import { ErrorWithExtras } from "components/ErrorWithExtras";

import { useUpdateOrgShortLinkEnabled } from "apiQueries/useUpdateOrgShortLinkEnabled";
import { useRedux } from "hooks/useRedux";
import { AppDispatch } from "store";
import { getOrgInfoAction } from "store/ducks/organization";

export const SettingsEnableShortLinking = () => {
  const { organization } = useRedux("organization");

  const dispatch: AppDispatch = useDispatch();

  const { mutateAsync, isPending, error, isSuccess } =
    useUpdateOrgShortLinkEnabled();

  useEffect(() => {
    if (isSuccess) {
      dispatch(getOrgInfoAction());
    }
  }, [dispatch, isSuccess]);

  const handleToggleChange = () => {
    mutateAsync(!organization.data.isLinkShortenerEnabled);
  };

  const renderContent = () => {
    return (
      <div className="SdpSettings">
        <div className="SdpSettings__row">
          <div className="SdpSettings__item">
            <label
              className="SdpSettings__label"
              htmlFor="payment-cancellation"
            >
              Enable short linking
            </label>
            <div className="Toggle__wrapper">
              {isPending ? <Loader size="1rem" /> : null}
              <Toggle
                id="payment-cancellation"
                checked={Boolean(organization.data.isLinkShortenerEnabled)}
                onChange={handleToggleChange}
                disabled={isPending}
              />
            </div>
          </div>
          <div className="Note">
            Select this option to use shorter links when inviting receivers. The
            short link format will look like <code>{API_URL}/r/abcd1234</code>.
          </div>
        </div>
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
