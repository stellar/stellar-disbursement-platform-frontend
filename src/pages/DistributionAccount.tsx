import { Fragment } from "react";
import {
  Card,
  Heading,
  Profile,
  Title,
  Notification,
} from "@stellar/design-system";
import { useDispatch } from "react-redux";

import { InfoTooltip } from "components/InfoTooltip";
import { SectionHeader } from "components/SectionHeader";
import { AccountBalances } from "components/AccountBalances";
import { WalletTrustlines } from "components/WalletTrustlines";
import { LoadingContent } from "components/LoadingContent";

import { useRedux } from "hooks/useRedux";
import { useOrgAccountInfo } from "hooks/useOrgAccountInfo";
import { AppDispatch } from "store";
import { getStellarAccountAction } from "store/ducks/organization";

export const DistributionAccount = () => {
  const { organization } = useRedux("organization");
  const { assetBalances, distributionAccountPublicKey } = organization.data;

  useOrgAccountInfo(distributionAccountPublicKey);

  const dispatch: AppDispatch = useDispatch();

  const renderContent = () => {
    if (organization.status === "PENDING") {
      return <LoadingContent />;
    }

    if (organization.errorString) {
      return (
        <Notification variant="error" title="Error">
          {organization.errorString}
        </Notification>
      );
    }

    if (assetBalances?.length === 0) {
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

          <>
            {assetBalances?.map((a) => (
              <Fragment key={a.address}>
                {<AccountBalances accountInfo={a} />}
              </Fragment>
            ))}
          </>
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
          balances={assetBalances?.[0].balances || undefined}
          onSuccess={() => {
            dispatch(getStellarAccountAction(distributionAccountPublicKey));
          }}
        />
      </div>
    </>
  );
};
