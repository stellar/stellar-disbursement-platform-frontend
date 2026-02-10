import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { Card, Heading, Notification, Modal, Button, Loader, Icon } from "@stellar/design-system";

import { ErrorWithExtras } from "@/components/ErrorWithExtras";
import { InfoTooltip } from "@/components/InfoTooltip";
import { LoadingContent } from "@/components/LoadingContent";
import { SectionHeader } from "@/components/SectionHeader";
import { WalletCard } from "@/components/WalletCard";

import { Routes } from "@/constants/settings";

import { useWallets } from "@/apiQueries/useWallets";
import { useWalletsEnable } from "@/apiQueries/useWalletsEnable";

import { useIsUserRoleAccepted } from "@/hooks/useIsUserRoleAccepted";

import { ApiWallet } from "@/types";

export const WalletProviders = () => {
  const [selectedWallet, setSelectedWallet] = useState<
    { id: string; enabled: boolean } | undefined
  >();
  const { isRoleAccepted: canEditWalletProviders } = useIsUserRoleAccepted(["owner", "developer"]);

  const navigate = useNavigate();

  const {
    data: wallets,
    error: walletsError,
    isPending: isWalletsPending,
    isFetching: isWalletsFetching,
    refetch: refetchWallets,
  } = useWallets({});

  const {
    error: walletEnableError,
    isSuccess: isWalletEnableSuccess,
    isError: isWalletEnableError,
    isPending: isWalletEnablePending,
    mutateAsync: enableWallet,
    reset: resetUpdateWallet,
  } = useWalletsEnable();

  const myWallets = wallets?.filter((e) => e.enabled);
  const availableWallets = wallets?.filter((e) => !e.enabled);
  const isWalletsLoading = isWalletsFetching && !isWalletsPending;

  const handleCloseModal = () => {
    setSelectedWallet(undefined);
  };

  const goToNewWallet = () => {
    navigate(Routes.WALLET_PROVIDERS_NEW);
  };

  useEffect(() => {
    if (isWalletEnableSuccess || isWalletEnableError) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleCloseModal();
    }

    if (isWalletEnableSuccess) {
      refetchWallets();
    }
  }, [isWalletEnableSuccess, isWalletEnableError, refetchWallets]);

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

            if (isWalletEnableSuccess || isWalletEnableError) {
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

            {isWalletsLoading ? <Loader /> : null}
          </SectionHeader.Content>

          {canEditWalletProviders ? (
            <SectionHeader.Content align="right">
              <Button
                size="md"
                variant="primary"
                icon={<Icon.Plus />}
                disabled={isWalletsLoading}
                onClick={goToNewWallet}
              >
                Add new wallet
              </Button>
            </SectionHeader.Content>
          ) : null}
        </SectionHeader.Row>
      </SectionHeader>

      {isWalletsPending ? <LoadingContent /> : null}

      <div className="CardStack">
        {walletsError || walletEnableError ? (
          <Notification variant="error" title="Error" isFilled={true}>
            <ErrorWithExtras appError={walletsError || walletEnableError} />
          </Notification>
        ) : null}

        {wallets ? (
          <>
            <Card>
              <div className="CardStack__card">
                <div className="CardStack__title">
                  <InfoTooltip infoText="The wallet providers allowed by your organization for receiving payments.">
                    Enabled Wallets
                  </InfoTooltip>
                </div>

                {renderWalletCard(myWallets, "selected")}
              </div>
            </Card>

            <Card>
              <div className="CardStack__card">
                <div className="CardStack__title">
                  <InfoTooltip infoText="All available wallet providers that can receive disbursements. You must add these to your wallet providers in order to send payments into them.">
                    Available Wallets
                  </InfoTooltip>
                </div>
                {availableWallets?.length ? (
                  <div className="Note">
                    By enabling, this will alow any disbursement to this provider.
                  </div>
                ) : null}

                {renderWalletCard(availableWallets, "available")}
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
              enableWallet({
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
                isFilled={true}
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
                isFilled={true}
              ></Notification>
            </Modal.Body>
          )}
          <Modal.Footer>
            <Button size="md" variant="tertiary" type="reset" isLoading={isWalletEnablePending}>
              Cancel
            </Button>
            <Button
              size="md"
              variant={selectedWallet?.enabled ? "destructive" : "primary"}
              type="submit"
              isLoading={isWalletEnablePending}
            >
              Turn {selectedWallet?.enabled ? "off" : "on"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
};
