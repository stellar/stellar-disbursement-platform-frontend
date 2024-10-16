import { Heading } from "@stellar/design-system";

import { SectionHeader } from "components/SectionHeader";
import { SettingsTeamMembers } from "components/SettingsTeamMembers";
import { ReceiverInviteMessage } from "components/ReceiverInviteMessage";
import { SettingsEnableReceiverInvitationRetry } from "components/SettingsEnableReceiverInvitationRetry";
import { SettingsEnablePaymentCancellation } from "components/SettingsEnablePaymentCancellation";

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

        {/* Enable Receiver Invitation retry */}
        <SettingsEnableReceiverInvitationRetry />

        {/* Customize receiver wallet invite */}
        <ReceiverInviteMessage />

        {/* Team members */}
        <SettingsTeamMembers />
      </div>
    </>
  );
};
