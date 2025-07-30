import { useEffect, useState } from "react";
import { Card, Heading, Notification, Modal, Button, Loader } from "@stellar/design-system";

import { InfoTooltip } from "components/InfoTooltip";
import { SectionHeader } from "components/SectionHeader";
import { LoadingContent } from "components/LoadingContent";
import { WalletCard } from "components/WalletCard";
import { ErrorWithExtras } from "components/ErrorWithExtras";

import { useWallets } from "apiQueries/useWallets";
import { useUpdateWallet } from "apiQueries/useUpdateWallet";
import { useIsUserRoleAccepted } from "hooks/useIsUserRoleAccepted";
import { ApiWallet } from "types";

export const WalletProviders = () => {
  const [selectedWallet, setSelectedWallet] = useState<
    { id: string; enabled: boolean } | undefined
  >();
  const { isRoleAccepted: canEditWalletProviders } = useIsUserRoleAccepted(["owner"]);

  const {
    data: wallets,
    error: walletsError,
    isPending: isWalletsPending,
    isFetching: isWalletsFetching,
    refetch: refetchWallets,
  } = useWallets({});

  const {
    error: walletUpdateError,
    isSuccess: isWalletUpdateSuccess,
    isError: isWalletUpdateError,
    isPending: isWalletUpdatePending,
    mutateAsync: updateWallet,
    reset: resetUpdateWallet,
  } = useUpdateWallet();

  const myWallets = wallets?.filter((e) => e.enabled);
  const avalaibleWallets = wallets?.filter((e) => !e.enabled);

  const handleCloseModal = () => {
    setSelectedWallet(undefined);
  };

  useEffect(() => {
    if (isWalletUpdateSuccess || isWalletUpdateError) {
      handleCloseModal();
    }

    if (isWalletUpdateSuccess) {
      refetchWallets();
    }
  }, [isWalletUpdateSuccess, isWalletUpdateError, refetchWallets]);

  const renderWalletCard = (
    walletsArray: ApiWallet[] | undefined,
    cardType: "selected" | "available",
  ) => {
    if (walletsArray?.length) {
      return walletsArray?.map((item) => (
        <WalletCard
          key={item.id}
          walletName={item.name}
          walletId={item.id}
          homepageUrl={item.homepage}
          enabled={item.enabled}
          assets={item.assets?.map((asset) => asset.code)}
          editable={canEditWalletProviders}
          userManaged={item.user_managed}
          onChange={() => {
            setSelectedWallet({ id: item.id, enabled: item.enabled });

            if (isWalletUpdateSuccess || isWalletUpdateError) {
              resetUpdateWallet();
            }
          }}
        />
      ));
    }

    return (
      <div className="Note">
        {cardType === "available"
          ? "There are no available wallet providers."
          : "There are no wallet providers allowed by your organization."}
      </div>
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
            {isWalletsFetching && !isWalletsPending ? <Loader /> : null}
          </SectionHeader.Content>
        </SectionHeader.Row>
      </SectionHeader>

      {isWalletsPending ? <LoadingContent /> : null}

      <div className="CardStack">
        {walletsError || walletUpdateError ? (
          <Notification variant="error" title="Error">
            <ErrorWithExtras appError={walletsError || walletUpdateError} />
          </Notification>
        ) : null}

        {wallets ? (
          <>
            <Card>
              <div className="CardStack__card">
                <div className="CardStack__title">
                  <InfoTooltip infoText="The wallet providers allowed by your organization for receiving payments.">
                    My Wallet Providers
                  </InfoTooltip>
                </div>

                {renderWalletCard(myWallets, "selected")}
              </div>
            </Card>

            <Card>
              <div className="CardStack__card">
                <div className="CardStack__title">
                  <InfoTooltip infoText="All available wallet providers that can receive disbursements. You must add these to your wallet providers in order to send payments into them.">
                    Available Wallet Providers
                  </InfoTooltip>
                </div>
                {avalaibleWallets?.length ? (
                  <div className="Note">
                    Make sure you agree with the wallet provider before adding them. They will also
                    need to enable your organization before payments will succeed.
                  </div>
                ) : null}

                {renderWalletCard(avalaibleWallets, "available")}
              </div>
            </Card>
          </>
        ) : null}
      </div>

      {/* Enable/Disable wallet modal */}
      <Modal visible={Boolean(selectedWallet)} onClose={handleCloseModal}>
        <Modal.Heading>
          Confirm turning {selectedWallet?.enabled ? "off" : "on"} wallet provider
        </Modal.Heading>
        <form
          onSubmit={(event) => {
            event.preventDefault();

            if (selectedWallet) {
              updateWallet({
                walletId: selectedWallet.id,
                enabled: !selectedWallet.enabled,
              });
            }
          }}
          onReset={handleCloseModal}
        >
          {selectedWallet?.enabled ? (
            <Modal.Body>
              <Notification
                variant="warning"
                title="This will disable all new disbursements to this provider"
              ></Notification>
            </Modal.Body>
          ) : (
            <Modal.Body>
              <div className="Note">
                Make sure the wallet provider knows you have added them as they will have to add you
                in order for this to work.
              </div>
              <Notification
                variant="warning"
                title="This will allow ANY disbursement to this provider"
              ></Notification>
            </Modal.Body>
          )}
          <Modal.Footer>
            <Button size="md" variant="tertiary" type="reset" isLoading={isWalletUpdatePending}>
              Cancel
            </Button>
            <Button
              size="md"
              variant={selectedWallet?.enabled ? "destructive" : "primary"}
              type="submit"
              isLoading={isWalletUpdatePending}
            >
              Turn {selectedWallet?.enabled ? "off" : "on"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
};
