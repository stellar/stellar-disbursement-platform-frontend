import { Heading } from "@stellar/design-system";

import { SectionHeader } from "components/SectionHeader";
import { SettingsTeamMembers } from "components/SettingsTeamMembers";
import { ReceiverInviteMessage } from "components/ReceiverInviteMessage";
import { SettingsEnableShortLinking } from "components/SettingsEnableShortLinking";
import { SettingsEnablePaymentCancellation } from "components/SettingsEnablePaymentCancellation";
import { SettingsEnableReceiverInvitationRetry } from "components/SettingsEnableReceiverInvitationRetry";
import { SettingsEnableMemoTracking } from "components/SettingsEnableMemoTracking";

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
        {/* Enable short link */}
        <SettingsEnableShortLinking />

        {/* Enable memo tracking */}
        <SettingsEnableMemoTracking />

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
