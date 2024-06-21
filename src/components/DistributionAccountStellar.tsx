import {
  Card,
  Heading,
  Profile,
  Title,
  Notification,
} from "@stellar/design-system";

import { InfoTooltip } from "components/InfoTooltip";
import { SectionHeader } from "components/SectionHeader";
import { AccountBalances } from "components/AccountBalances";
import { WalletTrustlines } from "components/WalletTrustlines";
import { LoadingContent } from "components/LoadingContent";
import { ErrorWithExtras } from "components/ErrorWithExtras";

import { useRedux } from "hooks/useRedux";
import { useOrgAccountInfo } from "hooks/useOrgAccountInfo";

export const DistributionAccountStellar = () => {
  const { organization } = useRedux("organization");
  const { distributionAccountPublicKey } = organization.data;

  const { balances, fetchAccountBalances } = useOrgAccountInfo(
    distributionAccountPublicKey,
  );

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
          <Profile
            publicAddress={distributionAccountPublicKey}
            size="sm"
            isCopy
            hideAvatar
          />
          <div className="Note Note--small">
            Add funds to your distribution account by sending Stellar-based
            digital assets to the public key above.
          </div>
          <div className="Note Note--small">
            It is strongly recommended that you only fund the distribution
            account when you are ready to send disbursements. It is not meant to
            be a long-term store of value, as any SDP user with permission to
            send disbursements can trigger payments from this account.
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
      </div>
    </>
  );
};
