import { Card, Heading, Icon, Link, Profile, Notification } from "@stellar/design-system";
import { useState } from "react";

import { ShowForRoles } from "./ShowForRoles";

import { useUpdateBridgeIntegration } from "@/apiQueries/useUpdateBridgeIntegration";
import { AccountBalances } from "@/components/AccountBalances";
import { Box } from "@/components/Box";
import { BridgeIntegrationSection } from "@/components/BridgeIntegrationSection";
import { BridgeOptInModal } from "@/components/BridgeOptInModal";
import { ErrorWithExtras } from "@/components/ErrorWithExtras";
import { InfoTooltip } from "@/components/InfoTooltip";
import { LoadingContent } from "@/components/LoadingContent";
import { SectionHeader } from "@/components/SectionHeader";
import { Title } from "@/components/Title";
import { WalletHistory } from "@/components/WalletHistory";
import { WalletTrustlines } from "@/components/WalletTrustlines";
import { STELLAR_EXPERT_URL } from "@/constants/envVariables";
import { useOrgAccountInfo } from "@/hooks/useOrgAccountInfo";
import { useRedux } from "@/hooks/useRedux";
import { BridgeIntegrationUpdate } from "@/types";

export const DistributionAccountStellar = () => {
  const [isBridgeOptInModalVisible, setIsBridgeOptInModalVisible] = useState(false);

  const { organization } = useRedux("organization");
  const { distributionAccountPublicKey } = organization.data;

  const { balances, fetchAccountBalances } = useOrgAccountInfo(distributionAccountPublicKey);

  const {
    mutateAsync: updateBridgeIntegration,
    isPending: isBridgeUpdatePending,
    error: bridgeUpdateError,
    reset: resetBridgeUpdate,
  } = useUpdateBridgeIntegration();

  const handleBridgeOptIn = () => {
    setIsBridgeOptInModalVisible(true);
  };

  const handleBridgeOptInModalClose = () => {
    setIsBridgeOptInModalVisible(false);
    resetBridgeUpdate();
  };

  const handleBridgeOptInSubmit = async (data: BridgeIntegrationUpdate) => {
    try {
      const result = await updateBridgeIntegration(data);
      // Only close modal on success
      setIsBridgeOptInModalVisible(false);

      // Redirect to KYC link if available in the response
      if (result?.kyc_status?.kyc_link) {
        window.open(result.kyc_status.kyc_link, "_blank", "noopener,noreferrer");
      }
    } catch {
      // do nothing
    }
  };

  const handleCreateVirtualAccount = async () => {
    try {
      await updateBridgeIntegration({ status: "READY_FOR_DEPOSIT" });
    } catch {
      // Error is handled by the mutation hook
    }
  };

  const renderContent = () => {
    if (organization.status === "PENDING") {
      return <LoadingContent />;
    }

    if (organization.errorString) {
      return (
        <Notification variant="error" title="Error" isFilled={true}>
          <ErrorWithExtras
            appError={{
              message: organization.errorString,
              extras: organization.errorExtras,
            }}
          />
        </Notification>
      );
    }

    if (balances?.length === 0) {
      return <div className="Note">There are no distribution accounts</div>;
    }

    return (
      <>
        <div>
          <Profile publicAddress={distributionAccountPublicKey} size="md" isCopy hideAvatar />
          <Box gap="xs" addlClassName="Note">
            <span>
              Fund your distribution account by sending Stellar-based digital assets to the public
              key above.
            </span>
            <span>
              Your distribution account serves as the source of funds for all outgoing payments. It
              is a standard Stellar account that can also receive incoming payments. To receive
              payments, provide your public key to the sender (no memo required). Assets sent to
              this address will appear immediately in your distribution account.
            </span>
            <span className="Note__emphasis">
              Note: For security and operational best practice, only fund this account when you’re
              ready to send disbursements. Any authorized SDP user with disbursement permissions can
              initiate payments from this account.
            </span>
          </Box>
        </div>

        <div className="WalletBalances">
          <Title size="sm">Current balance:</Title>
          <AccountBalances accountBalances={balances} />
        </div>
      </>
    );
  };

  return (
    <>
      <SectionHeader>
        <SectionHeader.Row>
          <SectionHeader.Content>
            <Heading as="h2" size="sm">
              Distribution Account
            </Heading>
          </SectionHeader.Content>
        </SectionHeader.Row>
      </SectionHeader>

      <div className="CardStack">
        <Card>
          <div className="CardStack__card">
            <div className="CardStack__title">
              <InfoTooltip infoText="The Stellar wallet address of the source of funds for your organization’s payments">
                Distribution account public key
              </InfoTooltip>
            </div>

            {renderContent()}
          </div>
        </Card>

        {/* TODO: hard-coded to a single wallet, figure out how to handle multiple */}
        <WalletTrustlines
          balances={balances || undefined}
          onSuccess={() => {
            fetchAccountBalances();
          }}
        />

        <Card>
          <div className="CardStack__card">
            <div className="CardStack__title">
              <Box gap="xs" direction="row" align="center">
                <InfoTooltip infoText="A record of payments to and from your distribution account, sourced directly from the Stellar network">
                  Wallet history
                </InfoTooltip>
                <Link href={`${STELLAR_EXPERT_URL}/account/${distributionAccountPublicKey}`}>
                  <Icon.LinkExternal01 className="ExternalLinkIcon" />
                </Link>
              </Box>
            </div>
            <WalletHistory stellarAddress={distributionAccountPublicKey} />
          </div>
        </Card>

        <ShowForRoles acceptedRoles={["owner", "financial_controller"]}>
          <BridgeIntegrationSection
            onOptIn={handleBridgeOptIn}
            onCreateVirtualAccount={handleCreateVirtualAccount}
          />
        </ShowForRoles>
      </div>

      <BridgeOptInModal
        visible={isBridgeOptInModalVisible}
        onClose={handleBridgeOptInModalClose}
        onSubmit={handleBridgeOptInSubmit}
        isLoading={isBridgeUpdatePending}
        error={bridgeUpdateError}
      />
    </>
  );
};
