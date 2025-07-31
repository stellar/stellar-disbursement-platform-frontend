import { useState, useEffect } from "react";
import { Badge, Button, Card, Notification, Icon } from "@stellar/design-system";

import { InfoTooltip } from "components/InfoTooltip";
import { LoadingContent } from "components/LoadingContent";
import { BridgeFaqModal } from "components/BridgeFaqModal";
import { BridgeStatusTracker } from "components/BridgeStatusTracker";
import { BridgeAccountDetails } from "components/BridgeAccountDetails";
import { BridgePaymentMethods } from "components/BridgePaymentMethods";

import { useBridgeIntegration } from "apiQueries/useBridgeIntegration";
import { getBridgeErrorMessage } from "constants/bridgeIntegration";

import { BridgeIntegration, BridgeIntegrationStatusType } from "types";

import "./styles.scss";

interface BridgeIntegrationSectionProps {
  onOptIn: () => void;
  onCreateVirtualAccount: () => void;
}

export const BridgeIntegrationSection = ({
  onOptIn,
  onCreateVirtualAccount,
}: BridgeIntegrationSectionProps) => {
  const { data: integration, isLoading, error, refetch } = useBridgeIntegration();
  const [showFaqModal, setShowFaqModal] = useState(false);

  // Note: Page Visibility API is used here because users are redirected
  // to external Bridge KYC pages outside our app's control.
  // When they return, this is the most reliable way to detect the navigation
  // and refresh the integration status.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, refetch bridge integration status
        refetch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refetch]);

  const renderInfoTooltip = () => {
    return (
      <InfoTooltip infoText="Liquidity sourcing via Bridge enables USD deposits that automatically convert to USDC on Stellar">
        Fund your account with Bridge
      </InfoTooltip>
    );
  };

  const getIntegrationStatus = (): BridgeIntegrationStatusType => {
    if (!integration) return "NOT_ENABLED";
    if ("status" in integration && typeof integration.status === "string") {
      return integration.status as BridgeIntegrationStatusType;
    }
    return (integration as BridgeIntegration).status;
  };

  const status = getIntegrationStatus();

  // Don't show section if Bridge is not enabled
  if (status === "NOT_ENABLED") {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <div className="CardStack__card">
          <div className="CardStack__title">{renderInfoTooltip()}</div>
          <LoadingContent />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="CardStack__card">
          <div className="CardStack__title">{renderInfoTooltip()}</div>
          <Notification variant="error" title="Error loading Bridge integration">
            <div className="BridgeIntegration__error">
              <p>{getBridgeErrorMessage(error)}</p>
              <Button
                size="md"
                variant="tertiary"
                onClick={() => refetch()}
                icon={<Icon.RefreshCcw04 />}
              >
                Try Again
              </Button>
            </div>
          </Notification>
        </div>
      </Card>
    );
  }

  const renderContent = () => {
    switch (status) {
      case "NOT_OPTED_IN":
        return (
          <div>
            <div className="Note Note--small">
              Create a virtual bank account with Bridge to fund your distribution account and accept
              USD payments via bank transfer. Funds sent to this virtual account are automatically
              converted to USDC on Stellar and deposited into your distribution account.
            </div>
            <div className="BridgeIntegration__button">
              <Button size="sm" variant="secondary" onClick={onOptIn}>
                Get Started with Bridge
              </Button>
            </div>
          </div>
        );

      case "OPTED_IN": {
        const bridgeData = integration as BridgeIntegration;
        const kycApproved = bridgeData.kyc_status.kyc_status === "approved";
        const tosApproved = bridgeData.kyc_status.tos_status === "approved";
        const canCreateVirtualAccount = kycApproved && tosApproved;

        return (
          <div className="BridgeIntegration">
            <BridgeStatusTracker kycStatus={bridgeData.kyc_status} onRefresh={() => refetch()} />

            {canCreateVirtualAccount && (
              <div className="BridgeIntegration__virtualAccountSection">
                <Notification variant="success" title="Ready to Create Virtual Account">
                  Congratulations, you're ready to create your virtual USD bank account with Bridge!
                  Click the button below to create account details and start accepting USD payments.
                </Notification>
                <div className="BridgeIntegration__actions">
                  <Button size="sm" variant="primary" onClick={onCreateVirtualAccount}>
                    Create Virtual Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      }

      case "READY_FOR_DEPOSIT": {
        const accountData = integration as BridgeIntegration;
        const virtualAccount = accountData.virtual_account;

        if (!virtualAccount) {
          return (
            <Notification variant="error" title="Virtual account data unavailable">
              Please try refreshing the page or contact support.
            </Notification>
          );
        }

        return (
          <div className="BridgeIntegration">
            <div className="BridgeIntegration__account">
              <div className="BridgeIntegration__accountHeader">
                <div className="Note">Virtual USD Deposit Account</div>
                <Badge variant="success">Active</Badge>
              </div>

              <div className="Note">
                Deposits to this account will automatically convert to USDC on Stellar and be
                deposited in your distribution account. Processing typically takes 1-2 business
                days.
              </div>

              <BridgeAccountDetails virtualAccount={virtualAccount} />

              <BridgePaymentMethods
                paymentRails={virtualAccount.source_deposit_instructions.payment_rails}
              />

              <div className="Note">
                You may fund this account yourself or provide your virtual account details to others
                as a way to accept USD bank transfers.
              </div>

              <div className="BridgeIntegration__faqSection">
                <Button
                  size="sm"
                  variant="tertiary"
                  onClick={() => setShowFaqModal(true)}
                  icon={<Icon.InfoCircle />}
                >
                  Virtual Account FAQ
                </Button>
              </div>
            </div>
          </div>
        );
      }

      case "ERROR":
        return (
          <Notification variant="error" title="Bridge integration error">
            There was an issue with your Bridge integration. Please try again or contact support.
          </Notification>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Card>
        <div className="CardStack__card">
          <div className="CardStack__title">{renderInfoTooltip()}</div>
          {renderContent()}
        </div>
      </Card>

      <BridgeFaqModal visible={showFaqModal} onClose={() => setShowFaqModal(false)} />
    </>
  );
};
