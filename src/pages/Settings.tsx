import { Heading } from "@stellar/design-system";

import { ReceiverInviteMessage } from "@/components/ReceiverInviteMessage";
import { SectionHeader } from "@/components/SectionHeader";
import { SettingsEnableCaptcha } from "@/components/SettingsEnableCAPTCHA";
import { SettingsEnableMemoTracking } from "@/components/SettingsEnableMemoTracking";
import { SettingsEnableMfa } from "@/components/SettingsEnableMFA";
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
        <SettingsEnableMfa />

        {/* Disable CAPTCHA */}
        <SettingsEnableCaptcha />

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
