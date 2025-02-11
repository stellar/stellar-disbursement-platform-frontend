import { useEffect } from "react";
import { Card, Notification, Toggle, Loader } from "@stellar/design-system";
import { useDispatch } from "react-redux";

import { ErrorWithExtras } from "components/ErrorWithExtras";

import { useUpdateOrgMemoTrackingEnabled } from "apiQueries/useUpdateOrgMemoTrackingEnabled";
import { useRedux } from "hooks/useRedux";
import { AppDispatch } from "store";
import { getOrgInfoAction } from "store/ducks/organization";

export const SettingsEnableMemoTracking = () => {
  const { organization } = useRedux("organization");

  const dispatch: AppDispatch = useDispatch();

  const { mutateAsync, isPending, error, isSuccess } =
    useUpdateOrgMemoTrackingEnabled();

  useEffect(() => {
    if (isSuccess) {
      dispatch(getOrgInfoAction());
    }
  }, [dispatch, isSuccess]);

  const handleToggleChange = () => {
    mutateAsync(!organization.data.isMemoTrackingEnabled);
  };

  const renderContent = () => {
    return (
      <div className="SdpSettings">
        <div className="SdpSettings__row">
          <div className="SdpSettings__item">
            <label
              className="SdpSettings__label"
              htmlFor="memo-tracking-toggle"
            >
              Enable memo tracking
            </label>
            <div className="Toggle__wrapper">
              {isPending ? <Loader size="1rem" /> : null}
              <Toggle
                id="memo-tracking-toggle"
                checked={Boolean(organization.data.isMemoTrackingEnabled)}
                onChange={handleToggleChange}
                disabled={isPending}
              />
            </div>
          </div>
          <div className="Note">
            Select this option to optionally attach a memo to your payments for
            tracking purposes. The memo would look like{" "}
            <code>sdp-100680ad546c</code>.
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
