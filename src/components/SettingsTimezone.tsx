import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Card, Select, Notification } from "@stellar/design-system";
import { InfoTooltip } from "components/InfoTooltip";
import { DropdownMenu } from "components/DropdownMenu";
import { MoreMenuButton } from "components/MoreMenuButton";
import { NotificationWithButtons } from "components/NotificationWithButtons";
import { ErrorWithExtras } from "components/ErrorWithExtras";
import { TIME_ZONES } from "constants/settings";
import { useRedux } from "hooks/useRedux";
import { AppDispatch } from "store";
import {
  updateOrgInfoAction,
  clearUpdateMessageAction,
  getOrgInfoAction,
} from "store/ducks/organization";

export const SettingsTimezone = () => {
  const { organization } = useRedux("organization");

  const [isEdit, setIsEdit] = useState(false);
  const [newTimezone, setNewTimezone] = useState("");

  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (organization.updateMessage) {
      dispatch(getOrgInfoAction());
      resetState();
    }
  }, [dispatch, organization.updateMessage]);

  useEffect(() => {
    return () => {
      dispatch(clearUpdateMessageAction());
    };
  }, [dispatch]);

  const resetState = () => {
    setIsEdit(false);
    setNewTimezone("");
  };

  const handleCancel = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetState();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newTimezone) {
      dispatch(updateOrgInfoAction({ timezone: newTimezone }));
    }
  };

  return (
    <>
      {organization.updateMessage ? (
        <NotificationWithButtons
          variant="success"
          title="Timezone updated"
          buttons={[
            {
              label: "Dismiss",
              onClick: () => {
                dispatch(clearUpdateMessageAction());
              },
            },
          ]}
        >
          {organization.updateMessage}
        </NotificationWithButtons>
      ) : null}

      {organization.errorString ? (
        <Notification variant="error" title="Error">
          <ErrorWithExtras
            appError={{
              message: organization.errorString,
              extras: organization.errorExtras,
            }}
          />
        </Notification>
      ) : null}

      <Card>
        <div className="CardStack__card">
          <div className="CardStack__title">
            <InfoTooltip infoText="Set your local timezone for your personal account">
              Timezone
            </InfoTooltip>

            <DropdownMenu triggerEl={<MoreMenuButton />}>
              <DropdownMenu.Item
                onClick={() => {
                  setIsEdit(true);
                  setNewTimezone(organization.data.timezoneUtcOffset);
                }}
              >
                Edit timezone
              </DropdownMenu.Item>
            </DropdownMenu>
          </div>

          <form onSubmit={handleSubmit} onReset={handleCancel}>
            <div className="CardStack__body">
              <Select
                fieldSize="md"
                id="timezone"
                name="timezone"
                disabled={!isEdit}
                note="All times will be reflected in this timezone"
                value={isEdit ? newTimezone : organization.data.timezoneUtcOffset}
                onChange={(event) => {
                  setNewTimezone(event.target.value);
                }}
              >
                {TIME_ZONES.map((tz) => (
                  <option value={tz.value} key={tz.value}>
                    {tz.name}
                  </option>
                ))}
              </Select>
            </div>

            {isEdit ? (
              <div className="CardStack__buttons">
                <Button variant="tertiary" size="sm" type="reset">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  isLoading={organization.status === "PENDING"}
                  disabled={newTimezone === organization.data.timezoneUtcOffset}
                >
                  Confirm
                </Button>
              </div>
            ) : null}
          </form>
        </div>
      </Card>
    </>
  );
};
