import {
  Card,
  Heading,
  Icon,
  Toggle,
  Title,
  Notification,
  Modal,
  Button,
} from "@stellar/design-system";
import { useDispatch } from "react-redux";
import { InfoTooltip } from "components/InfoTooltip";
import { SectionHeader } from "components/SectionHeader";
import { useRedux } from "hooks/useRedux";
import { useState, useEffect } from "react";
import { AppDispatch } from "store";
import { getWalletsAction, updateWalletAction } from "store/ducks/wallets";

export const WalletProviders = () => {
  const [updateWalletModal, setUpdateWalletModal] = useState({
    visible: false,
    walletId: "",
    enabled: false,
  });

  const { wallets } = useRedux("wallets");
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (!wallets.status) {
      dispatch(getWalletsAction());
    }
  }, [wallets.status, dispatch]);

  const myWallets = wallets.items.filter((e) => e.enabled);
  const avalaibleWallets = wallets.items.filter((e) => !e.enabled);

  const handleCloseModal = () => {
    setUpdateWalletModal({ visible: false, walletId: "", enabled: false });
  };

  const handleUpdateWallet = (walletId: string, enabled: boolean) => {
    dispatch(updateWalletAction({ walletId, enabled }));
    window.location.reload();
  };

  const renderWalletCard = (
    walletName: string,
    walletId: string,
    link: string,
    enabled: boolean,
    assets: string[],
  ) => {
    if (wallets.errorString) {
      return (
        <Notification variant="error" title="Error">
          {wallets.errorString}
        </Notification>
      );
    }

    return (
      <>
        <Card>
          <div className="StatCards__card--split">
            <div>
              <div className="StatCards__card__column">
                <div className="StatCards__card__item StatCards__card__item--inline">
                  <div>
                    <div className="StatCards__card__title">
                      <div
                        className="StatCards__card__item--inline"
                        style={{ gap: 0 }}
                      >
                        <Title size="lg">{walletName}</Title>

                        <Icon.ExternalLink
                          style={{
                            color: "#908E96",
                            width: "10%",
                            cursor: "pointer",
                          }}
                          onClick={() => window.open(link, "_blank")}
                        />
                      </div>
                    </div>
                  </div>

                  <Toggle
                    id={walletId}
                    checked={enabled}
                    onChange={() => {
                      setUpdateWalletModal({
                        visible: true,
                        walletId: walletId,
                        enabled: enabled,
                      });
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="StatCards__card__walletCounts">
                <br />
                <div className="StatCards__card--flexCols">
                  <label className="StatCards__card__item__label">
                    <Icon.Assets style={{ height: "60%" }} />
                    Supported assets
                  </label>
                  <div className="StatCards__card__item__value">
                    {assets.join(", ")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Enable/Disable wallet modal */}
        <Modal visible={updateWalletModal.visible} onClose={handleCloseModal}>
          <Modal.Heading>
            Confirm turning {updateWalletModal.enabled ? "off" : "on"} wallet
            provider
          </Modal.Heading>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleUpdateWallet(
                updateWalletModal.walletId,
                !updateWalletModal.enabled,
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
                variant={updateWalletModal.enabled ? "destructive" : "primary"}
                type="submit"
              >
                Turn {updateWalletModal.enabled ? "off" : "on"}
              </Button>
            </Modal.Footer>
          </form>
        </Modal>
      </>
    );
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
              <InfoTooltip infoText="">My Wallet Providers</InfoTooltip>
            </div>

            {myWallets.map((item) =>
              renderWalletCard(
                item.name,
                item.id,
                item.homepage,
                item.enabled,
                item.assets.map((e) => e.code),
              ),
            )}
          </div>
        </Card>

        <Card>
          <div className="CardStack__card">
            <div className="CardStack__title">
              <InfoTooltip infoText="">Available Wallet Providers</InfoTooltip>
            </div>
            <div className="Note">
              Make sure the wallet provider knows you have added them as they
              will have to add you in order for this to work.
            </div>

            {avalaibleWallets.map((item) =>
              renderWalletCard(
                item.name,
                item.id,
                item.homepage,
                item.enabled,
                item.assets.map((e) => e.code),
              ),
            )}
          </div>
        </Card>
      </div>
    </>
  );
};
