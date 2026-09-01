import { useState } from "react";

import { Card, Heading, Icon, Link, Profile, Notification } from "@stellar/design-system";

import { AccountBalances } from "@/components/AccountBalances";
import { Box } from "@/components/Box";
import { BridgeIntegrationSection } from "@/components/BridgeIntegrationSection";
import { BridgeOptInModal } from "@/components/BridgeOptInModal";
import { DistributionAccountLabel } from "@/components/DistributionAccountLabel";
import { ErrorWithExtras } from "@/components/ErrorWithExtras";
import { InfoTooltip } from "@/components/InfoTooltip";
import { LoadingContent } from "@/components/LoadingContent";
import { SectionHeader } from "@/components/SectionHeader";
import { Title } from "@/components/Title";
import { WalletHistory } from "@/components/WalletHistory";
import { WalletTrustlines } from "@/components/WalletTrustlines";

import { STELLAR_EXPERT_URL } from "@/constants/envVariables";

import { useUpdateBridgeIntegration } from "@/apiQueries/useUpdateBridgeIntegration";

import { useOrgAccountInfo } from "@/hooks/useOrgAccountInfo";
import { useRedux } from "@/hooks/useRedux";

import { ShowForRoles } from "./ShowForRoles";

import { BridgeIntegrationUpdate } from "@/types";

interface DistributionAccountStellarProps {
  // Multi-account: scope the page to a specific distribution account. Defaults to the
  // tenant's (single/default) account for unchanged single-account behavior.
  accountName?: string;
  // `undefined` means there is no wallet record at all (legacy single-account tenant), and the
  // tenant-level fallback below is correct. `null` means a real wallet record whose Stellar
  // account isn't provisioned yet — falling back there would label this account's name with the
  // tenant default's address, balances and history.
  accountAddress?: string | null;
  accountId?: string;
  isDefaultAccount?: boolean;
  // Trustlines are per-account on-chain state: the rows come from this account's own Horizon
  // balances, and adding one now targets this account via X-Wallet-Id. Shown for any account
  // whose identity is unambiguous — hidden only on the "All accounts" aggregate, where there is
  // no single account for the mutation to target.
  showTrustlines?: boolean;
  // Bridge is genuinely TENANT-level (PATCH /bridge-integration takes no wallet scope), so it
  // belongs on the default account's card only. Previously this rode on showTrustlines; once
  // trustlines were un-gated for secondary accounts that would have implied per-account Bridge
  // config which does not exist.
  showBridgeIntegration?: boolean;
}

export const DistributionAccountStellar = ({
  accountName,
  accountAddress,
  accountId,
  isDefaultAccount = false,
  showTrustlines = true,
  showBridgeIntegration = true,
}: DistributionAccountStellarProps) => {
  const [isBridgeOptInModalVisible, setIsBridgeOptInModalVisible] = useState(false);

  const { organization } = useRedux("organization");
  const hasWalletRecord = accountAddress !== undefined;
  const distributionAccountPublicKey = hasWalletRecord
    ? accountAddress || undefined
    : organization.data.distributionAccountPublicKey;
  const isAddressUnavailable = !distributionAccountPublicKey;

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

    // No address of its own yet. The tenant default is not a stand-in here: it belongs to a
    // different account than the one this page is named after.
    if (isAddressUnavailable) {
      return (
        <div className="Note">
          This account doesn’t have a Stellar address yet — its balances and history will appear
          once its on-chain account has been provisioned.
        </div>
      );
    }

    if (balances?.length === 0) {
      return (
        <div className="Note">No funds yet — send assets to the address above to get started.</div>
      );
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
              {accountName && accountId ? (
                <DistributionAccountLabel
                  wallet={{ id: accountId, name: accountName, is_default: isDefaultAccount }}
                  defaultMarker="text"
                />
              ) : (
                (accountName ?? "Distribution account")
              )}
            </Heading>
          </SectionHeader.Content>
        </SectionHeader.Row>
      </SectionHeader>

      <div className="CardStack">
        <Card>
          <div className="CardStack__card">
            <div className="CardStack__title">
              <InfoTooltip infoText="The Stellar address that funds this account's outgoing payments">
                Account address
              </InfoTooltip>
            </div>

            {renderContent()}
          </div>
        </Card>

        {showTrustlines ? (
          <WalletTrustlines
            balances={balances || undefined}
            onSuccess={() => {
              fetchAccountBalances();
            }}
          />
        ) : null}

        {isAddressUnavailable ? null : (
          <Card>
            <div className="CardStack__card">
              <div className="CardStack__title">
                <Box gap="xs" direction="row" align="center">
                  <InfoTooltip infoText="A record of payments to and from this account, sourced directly from the Stellar network">
                    Account history
                  </InfoTooltip>
                  <Link href={`${STELLAR_EXPERT_URL}/account/${distributionAccountPublicKey}`}>
                    <Icon.LinkExternal01 className="ExternalLinkIcon" />
                  </Link>
                </Box>
              </div>
              <WalletHistory stellarAddress={distributionAccountPublicKey} />
            </div>
          </Card>
        )}

        {showBridgeIntegration ? (
          <ShowForRoles acceptedRoles={["owner", "financial_controller"]}>
            <BridgeIntegrationSection
              onOptIn={handleBridgeOptIn}
              onCreateVirtualAccount={handleCreateVirtualAccount}
            />
          </ShowForRoles>
        ) : null}
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
