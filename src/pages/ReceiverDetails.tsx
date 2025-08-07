import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Heading,
  Notification,
  Profile,
  Select,
  Button,
  Modal,
} from "@stellar/design-system";

import { GENERIC_ERROR_MESSAGE, Routes } from "constants/settings";

import { Breadcrumbs } from "components/Breadcrumbs";
import { SectionHeader } from "components/SectionHeader";
import { CopyWithIcon } from "components/CopyWithIcon";
import { AssetAmount } from "components/AssetAmount";
import { InfoTooltip } from "components/InfoTooltip";
import { ReceiverWalletBalance } from "components/ReceiverWalletBalance";
import { ReceiverWalletHistory } from "components/ReceiverWalletHistory";
import { LoadingContent } from "components/LoadingContent";
import { NotificationWithButtons } from "components/NotificationWithButtons";
import { ReceiverPayments } from "components/ReceiverPayments";
import { ErrorWithExtras } from "components/ErrorWithExtras";

import { useReceiversReceiverId } from "apiQueries/useReceiversReceiverId";
import { useReceiverWalletInviteSmsRetry } from "apiQueries/useReceiverWalletInviteSmsRetry";
import { useUpdateReceiverWalletStatus } from "apiQueries/useUpdateReceiverWalletStatus";

import { percent } from "helpers/formatIntlNumber";
import { renderNumberOrDash } from "helpers/renderNumberOrDash";
import { formatDateTime } from "helpers/formatIntlDateTime";
import { shortenAccountKey } from "helpers/shortenAccountKey";
import { renderTextWithCount } from "helpers/renderTextWithCount";

import { ReceiverWallet, ReceiverDetails as ReceiverDetailsType } from "types";

export const ReceiverDetails = () => {
  const { id: receiverId } = useParams();

  const [selectedWallet, setSelectedWallet] = useState<ReceiverWallet>();
  const [isUnregisterModalVisible, setIsUnregisterModalVisible] = useState(false);

  const {
    data: receiverDetails,
    isSuccess: isReceiverDetailsSuccess,
    isLoading: isReceiverDetailsLoading,
    error: receiverDetailsError,
  } = useReceiversReceiverId<ReceiverDetailsType>({
    receiverId,
    dataFormat: "receiver",
  });

  const {
    isSuccess: isInvitationRetrySuccess,
    isFetching: isInvitationRetryFetching,
    isError: isInvitationRetryError,
    error: invitationRetryError,
    refetch: retryReceiverInvitation,
  } = useReceiverWalletInviteSmsRetry(selectedWallet?.id);

  const {
    mutateAsync: unregisterWallet,
    isPending: isUnregisterWalletPending,
    isSuccess: isUnregisterWalletSuccess,
    isError: isUnregisterWalletError,
    error: unregisterWalletError,
    reset: resetUnregisterWallet,
  } = useUpdateReceiverWalletStatus();

  const [selectedWalletId, setSelectedWalletId] = useState<string | undefined>(
    receiverDetails?.wallets?.[0]?.id,
  );

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const stats = receiverDetails?.stats;
  const defaultWalletId = receiverDetails?.wallets?.[0]?.id;

  const resetInvitationRetry = () => {
    queryClient.resetQueries({
      queryKey: ["receivers", "wallets", "sms", "retry"],
    });
  };

  useEffect(() => {
    if (isReceiverDetailsSuccess) {
      setSelectedWalletId(defaultWalletId);
    }
  }, [defaultWalletId, isReceiverDetailsSuccess]);

  useEffect(() => {
    if (selectedWalletId && receiverDetails?.wallets) {
      setSelectedWallet(receiverDetails.wallets.find((w) => w.id === selectedWalletId));
    }
  }, [selectedWalletId, receiverDetails]);

  useEffect(() => {
    return () => {
      if (isInvitationRetrySuccess || isInvitationRetryError) {
        resetInvitationRetry();
      }
      if (isUnregisterWalletSuccess || isUnregisterWalletError) {
        resetUnregisterWallet();
      }
    };
    // Don't need to include queryClient.resetQueries
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isInvitationRetryError,
    isInvitationRetrySuccess,
    isUnregisterWalletError,
    isUnregisterWalletSuccess,
  ]);

  useEffect(() => {
    if (isUnregisterWalletSuccess) {
      // Trigger receiver details refetch
      queryClient.invalidateQueries({
        queryKey: ["receivers", "receiver", receiverId],
      });
    }
  }, [isUnregisterWalletSuccess, queryClient, receiverId]);

  const showUnregisterModal = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    resetUnregisterWallet();
    setIsUnregisterModalVisible(true);
  };

  const hideUnregisterModal = () => {
    setIsUnregisterModalVisible(false);
    if (isUnregisterWalletError) {
      resetUnregisterWallet();
    }
  };

  const calculateRate = () => {
    if (!stats) return 0;

    const numerator = stats.paymentsSuccessfulCount;
    const denominator = stats.paymentsTotalCount;
    if (!denominator) return 0;

    return Number(numerator / denominator);
  };

  const setCardTemplateRows = (rows: number) => {
    return {
      "--StatCard-template-rows": rows,
    } as React.CSSProperties;
  };

  const renderRetryInvitationButton = () => {
    return (
      <Button
        variant="tertiary"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          retryReceiverInvitation();
        }}
        isLoading={isInvitationRetryFetching}
        disabled={Boolean(selectedWallet?.stellarAddress)}
        {...(selectedWallet?.stellarAddress
          ? { title: "This wallet has already been registered" }
          : {})}
      >
        Retry invitation message
      </Button>
    );
  };

  const renderUnregisterWalletButton = () => {
    return (
      <Button
        variant="tertiary"
        size="sm"
        onClick={showUnregisterModal}
        isLoading={isUnregisterWalletPending}
        title="Unregister this wallet"
      >
        Unregister Wallet
      </Button>
    );
  };

  const renderInfoCards = () => {
    if (!receiverDetails) {
      return null;
    }

    return (
      <div className="StatCards StatCards--disbursementDetails">
        <Card>
          <div className="StatCards__card StatCards__card--grid">
            <div className="StatCards__card__item StatCards__card__item--fullWidth">
              <label className="StatCards__card__item__label">Total received</label>
              <div className="StatCards__card__item__value">
                <AssetAmount
                  amount={receiverDetails.totalReceived}
                  assetCode={receiverDetails.assetCode}
                  fallback="-"
                />
              </div>
            </div>

            <div className="StatCards__card__item StatCards__card__item--fullWidth">
              <label className="StatCards__card__item__label">Org ID</label>
              <div className="StatCards__card__item__value">{receiverDetails.orgId || "-"}</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="StatCards__card StatCards__card--grid StatCards__card--wideGap">
            <div
              className="StatCards__card__column"
              style={{
                ...setCardTemplateRows(1),
                marginTop: 0,
              }}
            >
              <div>
                <div className="StatCards__card__title">
                  <InfoTooltip infoText="The percentage of payments completed successfully (pending payments are not counted as successful)">
                    Successful payment rate
                  </InfoTooltip>
                </div>
                {/* TODO: add chart */}
                <div className="StatCards__card__unit">{`${percent.format(calculateRate())}`}</div>
              </div>
            </div>

            <div className="StatCards__card__column" style={setCardTemplateRows(4)}>
              <div className="StatCards__card__item StatCards__card__item--inline">
                <label className="StatCards__card__item__label">Total payments</label>
                <div className="StatCards__card__item__value">
                  {renderNumberOrDash(receiverDetails.stats.paymentsTotalCount)}
                </div>
              </div>

              <div className="StatCards__card__item StatCards__card__item--inline">
                <label className="StatCards__card__item__label">Successful payments</label>
                <div className="StatCards__card__item__value">
                  {renderNumberOrDash(receiverDetails.stats.paymentsSuccessfulCount)}
                </div>
              </div>

              <div className="StatCards__card__item StatCards__card__item--inline">
                <label className="StatCards__card__item__label">Failed payments</label>
                <div className="StatCards__card__item__value">
                  {renderNumberOrDash(receiverDetails.stats.paymentsFailedCount)}
                </div>
              </div>

              <div className="StatCards__card__item StatCards__card__item--inline">
                <label className="StatCards__card__item__label">Canceled payments</label>
                <div className="StatCards__card__item__value">
                  {renderNumberOrDash(receiverDetails.stats.paymentsCanceledCount)}
                </div>
              </div>

              <div className="StatCards__card__item StatCards__card__item--inline">
                <label className="StatCards__card__item__label">Remaining payments</label>
                <div className="StatCards__card__item__value">
                  {renderNumberOrDash(receiverDetails.stats.paymentsRemainingCount)}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderWalletOptionText = (wallet: ReceiverWallet) => {
    return `${wallet.provider} (${
      wallet.stellarAddress ? shortenAccountKey(wallet.stellarAddress) : "Unregistered"
    })`;
  };

  const renderWallets = () => {
    if (!receiverDetails) {
      return null;
    }

    return (
      <div className="ReceiverDetails__wallets">
        {isInvitationRetrySuccess && (
          <NotificationWithButtons
            variant="success"
            title="Receiver invitation sent successfully!"
            buttons={[
              {
                label: "Dismiss",
                onClick: () => {
                  resetInvitationRetry();
                },
              },
            ]}
          >
            {" "}
          </NotificationWithButtons>
        )}
        {invitationRetryError && (
          <NotificationWithButtons
            variant="error"
            title="Error"
            buttons={[
              {
                label: "Dismiss",
                onClick: () => {
                  resetInvitationRetry();
                },
              },
            ]}
          >
            <ErrorWithExtras appError={invitationRetryError} />
          </NotificationWithButtons>
        )}
        {isUnregisterWalletSuccess && (
          <NotificationWithButtons
            variant="success"
            title="Wallet unregistered successfully!"
            buttons={[
              {
                label: "Dismiss",
                onClick: () => {
                  resetUnregisterWallet();
                },
              },
            ]}
          >
            The wallet has been set to 'Ready' status. The receiver can register again with their
            original link or you can resend the invitation message below.
          </NotificationWithButtons>
        )}
        {isUnregisterWalletError && (
          <NotificationWithButtons
            variant="error"
            title="Error Unregistering Wallet"
            buttons={[
              {
                label: "Dismiss",
                onClick: () => {
                  resetUnregisterWallet();
                },
              },
            ]}
          >
            <ErrorWithExtras appError={unregisterWalletError} />
          </NotificationWithButtons>
        )}
        <div className="ReceiverDetails__wallets__row">
          <div className="ReceiverDetails__wallets__dropdown">
            <Select
              fieldSize="sm"
              id="receiver-wallets"
              value={selectedWalletId}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedWalletId(event.currentTarget.value)
              }
            >
              {receiverDetails.wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {renderWalletOptionText(w)}
                </option>
              ))}
            </Select>

            <div className="ReceiverDetails__wallets__subtitle">
              {renderTextWithCount(receiverDetails.wallets.length, "wallet", "wallets")}
            </div>
          </div>

          <div>
            {selectedWallet?.stellarAddress
              ? renderUnregisterWalletButton()
              : renderRetryInvitationButton()}
          </div>
        </div>

        {selectedWallet ? (
          <>
            <Card>
              <div
                className="StatCards__card StatCards__card--grid StatCards__card--wideGap"
                style={{ "--StatCard-grid-columns": 3 } as React.CSSProperties}
              >
                {/* Column one */}
                <div className="StatCards__card__column">
                  <div className="StatCards__card__item StatCards__card__item--inline">
                    <label className="StatCards__card__item__label">Balance</label>
                    <div className="StatCards__card__item__value">
                      <ReceiverWalletBalance stellarAddress={selectedWallet.stellarAddress} />
                    </div>
                  </div>

                  <div className="StatCards__card__item StatCards__card__item--inline">
                    <label className="StatCards__card__item__label">Wallet address</label>
                    <div className="StatCards__card__item__value">
                      {selectedWallet.stellarAddress ? (
                        <Profile
                          size="md"
                          publicAddress={selectedWallet.stellarAddress}
                          isCopy
                          isShort
                          hideAvatar
                        />
                      ) : (
                        "Unregistered"
                      )}
                    </div>
                  </div>

                  <div className="StatCards__card__item StatCards__card__item--inline">
                    <label className="StatCards__card__item__label">Wallet address memo</label>
                    <div className="StatCards__card__item__value">
                      {selectedWallet.stellarAddressMemo || "-"}
                    </div>
                  </div>
                </div>

                {/* Column two */}
                <div className="StatCards__card__column">
                  <div className="StatCards__card__item StatCards__card__item--inline">
                    <label className="StatCards__card__item__label">Wallet provider</label>
                    <div className="StatCards__card__item__value">
                      {selectedWallet.provider || "-"}
                    </div>
                  </div>
                  <div className="StatCards__card__item StatCards__card__item--inline">
                    <label className="StatCards__card__item__label">Total payments received</label>
                    <div className="StatCards__card__item__value">
                      {renderNumberOrDash(selectedWallet.totalPaymentsCount)}
                    </div>
                  </div>

                  <div className="StatCards__card__item StatCards__card__item--inline">
                    <label className="StatCards__card__item__label">Total amount received</label>
                    <div className="StatCards__card__item__value">
                      <AssetAmount
                        amount={selectedWallet.totalAmountReceived}
                        assetCode={selectedWallet.assetCode}
                        fallback="-"
                      />
                    </div>
                  </div>
                </div>

                {/* Column three */}
                <div className="StatCards__card__column">
                  <div className="StatCards__card__item StatCards__card__item--inline">
                    <label className="StatCards__card__item__label">Created at</label>
                    <div className="StatCards__card__item__value">
                      {formatDateTime(selectedWallet.createdAt)}
                    </div>
                  </div>

                  <div className="StatCards__card__item StatCards__card__item--inline">
                    <label className="StatCards__card__item__label">Invited at</label>
                    <div className="StatCards__card__item__value">
                      {formatDateTime(selectedWallet.invitedAt)}
                    </div>
                  </div>

                  <div className="StatCards__card__item StatCards__card__item--inline">
                    <label className="StatCards__card__item__label">Invitation last sent</label>
                    <div className="StatCards__card__item__value">
                      {formatDateTime(selectedWallet.smsLastSentAt)}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="DetailsSection DetailsSection">
              <SectionHeader>
                <SectionHeader.Row>
                  <SectionHeader.Content>
                    <Heading as="h4" size="xs">
                      Recent wallet history
                    </Heading>
                  </SectionHeader.Content>
                </SectionHeader.Row>
              </SectionHeader>

              <ReceiverWalletHistory stellarAddress={selectedWallet.stellarAddress} />
            </div>
          </>
        ) : null}
      </div>
    );
  };

  const renderContent = () => {
    if (isReceiverDetailsLoading) {
      return <LoadingContent />;
    }

    if (receiverDetailsError || !receiverDetails) {
      return (
        <Notification variant="error" title="Error">
          <ErrorWithExtras appError={receiverDetailsError || { message: GENERIC_ERROR_MESSAGE }} />
        </Notification>
      );
    }

    if (!receiverId || !receiverDetails.id) {
      return null;
    }

    return (
      <>
        <div className="DetailsSection">
          <SectionHeader>
            <SectionHeader.Row>
              <SectionHeader.Content>
                <Heading as="h2" size="sm">
                  {receiverDetails?.phoneNumber ? (
                    <CopyWithIcon textToCopy={receiverDetails.phoneNumber} iconSizeRem="1.5">
                      {receiverDetails.phoneNumber}
                    </CopyWithIcon>
                  ) : null}

                  {receiverDetails?.email ? (
                    <CopyWithIcon textToCopy={receiverDetails.email} iconSizeRem="1.5">
                      {receiverDetails.email}
                    </CopyWithIcon>
                  ) : null}
                </Heading>
              </SectionHeader.Content>
              <Button
                variant="tertiary"
                size="sm"
                type="reset"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`${Routes.RECEIVERS_EDIT}/${receiverId}`);
                }}
              >
                Edit receiver info
              </Button>
            </SectionHeader.Row>
          </SectionHeader>

          {renderInfoCards()}
        </div>

        <div className="DetailsSection">
          <SectionHeader>
            <SectionHeader.Row>
              <SectionHeader.Content>
                <Heading as="h3" size="xs">
                  Wallets
                </Heading>
              </SectionHeader.Content>
            </SectionHeader.Row>
          </SectionHeader>

          {renderWallets()}
        </div>

        <ReceiverPayments receiverId={receiverId} />
      </>
    );
  };

  return (
    <>
      <Breadcrumbs
        steps={[
          {
            label: "Receivers",
            route: Routes.RECEIVERS,
          },
          {
            label: "Receiver details",
          },
        ]}
      />

      {renderContent()}

      <Modal visible={isUnregisterModalVisible} onClose={hideUnregisterModal}>
        <Modal.Heading>Confirm Unregister Wallet</Modal.Heading>
        <Modal.Body>
          <p>
            Are you sure you want to unregister this wallet? The receiver will need to go through
            verification again to receive payments.
            <br />
            The receiver can register the same wallet if unregistered by mistake.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="tertiary"
            size="md"
            onClick={hideUnregisterModal}
            isLoading={isUnregisterWalletPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="md"
            onClick={(event) => {
              event.preventDefault();

              if (selectedWallet?.id) {
                unregisterWallet({
                  receiverWalletId: selectedWallet.id,
                  status: "READY",
                });
                setIsUnregisterModalVisible(false);
              }
            }}
            isLoading={isUnregisterWalletPending}
          >
            Unregister Wallet
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
