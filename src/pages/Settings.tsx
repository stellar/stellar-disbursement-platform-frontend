import { useDispatch } from "react-redux";
import { Heading, Notification } from "@stellar/design-system";

import { SectionHeader } from "components/SectionHeader";
import { NotificationWithButtons } from "components/NotificationWithButtons";
import { SettingsTeamMembers } from "components/SettingsTeamMembers";
import { ReceiverInviteMessage } from "components/ReceiverInviteMessage";
import { SettingsEnableSmsRetry } from "components/SettingsEnableSmsRetry";

import { AppDispatch } from "store";
import { resetNewUserAction, resetUpdatedUserAction } from "store/ducks/users";
import { useRedux } from "hooks/useRedux";
import { userRoleText } from "helpers/userRoleText";
import { SettingsEnablePaymentCancellation } from "components/SettingsEnablePaymentCancellation";

export const Settings = () => {
  const { users } = useRedux("users");

  const dispatch: AppDispatch = useDispatch();

  const getUserNameText = (firstName?: string, lastName?: string) => {
    if (firstName || lastName) {
      return `${firstName} ${lastName}`;
    }

    return "this user";
  };

  const renderUpdateUserSuccessMessage = () => {
    const user = users.items.find((u) => u.id === users.updatedUser.id);

    if (users.updatedUser.actionType === "status") {
      return `Account of ${getUserNameText(
        user?.first_name,
        user?.last_name,
      )} was updated successfully. New status is ${
        users.updatedUser.is_active ? "active" : "inactive"
      }.`;
    }

    if (users.updatedUser.actionType === "role") {
      return `Account of ${getUserNameText(
        user?.first_name,
        user?.last_name,
      )} was updated successfully. New role is ${userRoleText(
        users.updatedUser.role,
      )}.`;
    }

    return "Account was updated successfully.";
  };

  return (
    <>
      <SectionHeader>
        <SectionHeader.Row>
          <SectionHeader.Content>
            <Heading as="h2" size="sm">
              Settings
            </Heading>
          </SectionHeader.Content>
        </SectionHeader.Row>
      </SectionHeader>

      <div className="CardStack">
        {/* Enable automatic ready payments cancellation */}
        <SettingsEnablePaymentCancellation />

        {/* Enable SMS retry */}
        <SettingsEnableSmsRetry />

        {/* Customize receiver wallet invite */}
        <ReceiverInviteMessage />

        {/* Team members */}
        {users.updatedUser.status === "SUCCESS" ? (
          <NotificationWithButtons
            variant="success"
            title="Team member updated"
            buttons={[
              {
                label: "Dismiss",
                onClick: () => {
                  dispatch(resetUpdatedUserAction());
                },
              },
            ]}
          >
            {renderUpdateUserSuccessMessage()}
          </NotificationWithButtons>
        ) : null}

        {users.newUser.status === "SUCCESS" ? (
          <NotificationWithButtons
            variant="success"
            title="New team member added"
            buttons={[
              {
                label: "Dismiss",
                onClick: () => {
                  dispatch(resetNewUserAction());
                },
              },
            ]}
          >
            {`Team member ${users.newUser.first_name} ${
              users.newUser.last_name
            } with role ${userRoleText(
              users.newUser.role,
            )} was added successfully.`}
          </NotificationWithButtons>
        ) : null}

        {users.updatedUser.errorString || users.newUser.errorString ? (
          <Notification variant="error" title="Error">
            {users.updatedUser.errorString || users.newUser.errorString}
          </Notification>
        ) : null}

        {users.errorString ? (
          <Notification variant="error" title="Error">
            {users.errorString}
          </Notification>
        ) : (
          <SettingsTeamMembers getUserNameText={getUserNameText} />
        )}
      </div>
    </>
  );
};
