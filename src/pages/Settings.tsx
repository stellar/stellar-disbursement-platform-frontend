import { Heading } from "@stellar/design-system";

import { SectionHeader } from "components/SectionHeader";
import { SettingsTeamMembers } from "components/SettingsTeamMembers";
import { ReceiverInviteMessage } from "components/ReceiverInviteMessage";
import { SettingsEnableSmsRetry } from "components/SettingsEnableSmsRetry";
import { SettingsEnablePaymentCancellation } from "components/SettingsEnablePaymentCancellation";

import { AppDispatch } from "store";
import { resetNewUserAction, resetUpdatedUserAction } from "store/ducks/users";
import { useRedux } from "hooks/useRedux";
import { userRoleText } from "helpers/userRoleText";

export const Settings = () => {
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
        <SettingsTeamMembers />
      </div>
    </>
  );
};
