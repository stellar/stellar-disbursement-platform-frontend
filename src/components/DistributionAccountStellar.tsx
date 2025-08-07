import { useState } from "react";
import { Card, Heading, Profile, Notification } from "@stellar/design-system";

import { InfoTooltip } from "components/InfoTooltip";
import { SectionHeader } from "components/SectionHeader";
import { AccountBalances } from "components/AccountBalances";
import { WalletTrustlines } from "components/WalletTrustlines";
import { LoadingContent } from "components/LoadingContent";
import { ErrorWithExtras } from "components/ErrorWithExtras";
import { BridgeIntegrationSection } from "components/BridgeIntegrationSection";
import { BridgeOptInModal } from "components/BridgeOptInModal";
import { Title } from "components/Title";

import { useRedux } from "hooks/useRedux";
import { useOrgAccountInfo } from "hooks/useOrgAccountInfo";
import { useUpdateBridgeIntegration } from "apiQueries/useUpdateBridgeIntegration";

import { BridgeIntegrationUpdate } from "types";
import { ShowForRoles } from "./ShowForRoles";

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
        <Notification variant="error" title="Error">
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
          <Profile publicAddress={distributionAccountPublicKey} size="sm" isCopy hideAvatar />
          <div className="Note Note--small">
            Add funds to your distribution account by sending Stellar-based digital assets to the
            public key above.
          </div>
          <div className="Note Note--small">
            It is strongly recommended that you only fund the distribution account when you are
            ready to send disbursements. It is not meant to be a long-term store of value, as any
            SDP user with permission to send disbursements can trigger payments from this account.
          </div>
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
