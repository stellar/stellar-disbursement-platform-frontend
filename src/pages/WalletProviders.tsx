import {
  Card,
  Heading,
  Notification,
  Modal,
  Button,
} from "@stellar/design-system";
import { useDispatch } from "react-redux";
import { InfoTooltip } from "components/InfoTooltip";
import { SectionHeader } from "components/SectionHeader";
import { useRedux } from "hooks/useRedux";
import { useEffect } from "react";
import { AppDispatch } from "store";
import {
  getWalletsAction,
  actions,
  updateWalletAction,
} from "store/ducks/wallets";
import { WalletCard } from "components/WalletCard";
import { ApiWallet } from "types";

export const WalletProviders = () => {
  const { wallets } = useRedux("wallets");
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (!wallets.status) {
      dispatch(getWalletsAction());
    }
  }, [wallets.status, dispatch]);

  const myWallets = wallets?.items.filter((e) => e.enabled);
  const avalaibleWallets = wallets?.items.filter((e) => !e.enabled);

  const handleCloseModal = () => {
    dispatch(actions.resetUpdateWalletModal());
  };

  const handleUpdateWallet = async (walletId: string, enabled: boolean) => {
    await dispatch(updateWalletAction({ walletId, enabled }));
    window.location.reload();
  };

  const renderWalletCard = (walletsArray: ApiWallet[]) => {
    if (wallets.errorString) {
      return (
        <Notification variant="error" title="Error">
          {wallets.errorString}
        </Notification>
      );
    }

    return walletsArray?.map((item) => (
      <WalletCard
        key={item.id}
        walletName={item.name}
        walletId={item.id}
        homepageUrl={item.homepage}
        enabled={item.enabled}
        assets={item.assets?.map((asset) => asset.code)}
      />
    ));
  };

  return (
    <>
      <SectionHeader>
        <SectionHeader.Row>
          <SectionHeader.Content>
            <Heading as="h2" size="sm">
              Wallet Providers
            </Heading>
          </SectionHeader.Content>
        </SectionHeader.Row>
      </SectionHeader>

      <div className="CardStack">
        <Card>
          <div className="CardStack__card">
            <div className="CardStack__title">
              <InfoTooltip infoText="The wallet providers allowed by your organization for receiving payments.">
                My Wallet Providers
              </InfoTooltip>
            </div>

            {renderWalletCard(myWallets)}
          </div>
        </Card>

        <Card>
          <div className="CardStack__card">
            <div className="CardStack__title">
              <InfoTooltip infoText="All available wallet providers that can receive disbursements. You must add these to your wallet providers in order to send payments into them.">
                Available Wallet Providers
              </InfoTooltip>
            </div>
            <div className="Note">
              Make sure you agree with the wallet provider before adding them.
              They will also need to enable your organization before payments
              will succeed.
            </div>

            {renderWalletCard(avalaibleWallets)}
          </div>
        </Card>
      </div>

      {/* Enable/Disable wallet modal */}
      <Modal visible={wallets.modalVisibility} onClose={handleCloseModal}>
        <Modal.Heading>
          Confirm turning {wallets.modalWalletEnabled ? "off" : "on"} wallet
          provider
        </Modal.Heading>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleUpdateWallet(
              wallets.modalWalletId,
              !wallets.modalWalletEnabled,
            );
          }}
          onReset={handleCloseModal}
        >
          <Modal.Body>
            <div className="Note">
              Make sure the wallet provider knows you have added them as they
              will have to add you in order for this to work.
            </div>
            <Notification
              variant="warning"
              title="This will allow ANY disbursement to this provider"
            ></Notification>
          </Modal.Body>
          <Modal.Footer>
            <Button size="sm" variant="secondary" type="reset">
              Cancel
            </Button>
            <Button
              size="sm"
              variant={wallets.modalWalletEnabled ? "destructive" : "primary"}
              type="submit"
            >
              Turn {wallets.modalWalletEnabled ? "off" : "on"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
};
