import { useEffect } from "react";

import { useDispatch } from "react-redux";

import { Card, Loader, Notification, Toggle } from "@stellar/design-system";

import { ErrorWithExtras } from "@/components/ErrorWithExtras";

import { getOrgInfoAction } from "@/store/ducks/organization";

import { useUpdateOrgReceiverInvitationsDisabled } from "@/apiQueries/useUpdateOrgReceiverInvitationsDisabled";

import { useRedux } from "@/hooks/useRedux";

import { AppDispatch } from "@/store";

export const SettingsReceiverInvitationsDisabled = () => {
  const { organization } = useRedux("organization");

  const dispatch: AppDispatch = useDispatch();

  const { mutateAsync, isPending, error, isSuccess } = useUpdateOrgReceiverInvitationsDisabled();

  useEffect(() => {
    if (isSuccess) {
      dispatch(getOrgInfoAction());
    }
  }, [dispatch, isSuccess]);

  const handleToggleChange = () => {
    mutateAsync(!organization.data.receiver_invitations_disabled);
  };

  const renderContent = () => {
    return (
      <div className="SdpSettings">
        <div className="SdpSettings__row">
          <div className="SdpSettings__item">
            <label className="SdpSettings__label" htmlFor="receiver-invitations-disabled">
              Disable receiver invitations
            </label>
            <div className="Toggle__wrapper">
              {isPending ? <Loader size="1rem" /> : null}
              <Toggle
                id="receiver-invitations-disabled"
                checked={Boolean(organization.data.receiver_invitations_disabled)}
                onChange={handleToggleChange}
                disabled={isPending}
                fieldSize="sm"
              />
            </div>
          </div>
          <div className="Note">
            Toggle this option to stop the platform from sending invitation messages (SMS or email)
            to receivers. When disabled, you are responsible for delivering registration links to
            receivers through your own channels.
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
