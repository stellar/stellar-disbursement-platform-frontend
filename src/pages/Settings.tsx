import { Heading } from "@stellar/design-system";

import { ReceiverInviteMessage } from "@/components/ReceiverInviteMessage";
import { SectionHeader } from "@/components/SectionHeader";
import { SettingsDisableCaptcha } from "@/components/SettingsDisableCaptcha";
import { SettingsDisableMfa } from "@/components/SettingsDisableMfa";
import { SettingsEnableMemoTracking } from "@/components/SettingsEnableMemoTracking";
import { SettingsEnablePaymentCancellation } from "@/components/SettingsEnablePaymentCancellation";
import { SettingsEnableReceiverInvitationRetry } from "@/components/SettingsEnableReceiverInvitationRetry";
import { SettingsEnableShortLinking } from "@/components/SettingsEnableShortLinking";
import { SettingsTeamMembers } from "@/components/SettingsTeamMembers";

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
        {/* Disable MFA */}
        <SettingsDisableMfa />

        {/* Disable CAPTCHA */}
        <SettingsDisableCaptcha />

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
