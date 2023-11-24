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

import { useReceiversReceiverId } from "apiQueries/useReceiversReceiverId";
import { useReceiverWalletInviteSmsRetry } from "apiQueries/useReceiverWalletInviteSmsRetry";

import { percent } from "helpers/formatIntlNumber";
import { renderNumberOrDash } from "helpers/renderNumberOrDash";
import { formatDateTime } from "helpers/formatIntlDateTime";
import { shortenAccountKey } from "helpers/shortenAccountKey";
import { renderTextWithCount } from "helpers/renderTextWithCount";

import { ReceiverWallet, ReceiverDetails as ReceiverDetailsType } from "types";

export const ReceiverDetails = () => {
  const { id: receiverId } = useParams();

  const [selectedWallet, setSelectedWallet] = useState<ReceiverWallet>();

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
    isSuccess: isSmsRetrySuccess,
    isFetching: isSmsRetryFetching,
    isError: isSmsRetryError,
    error: smsRetryError,
    refetch: retrySmsInvite,
  } = useReceiverWalletInviteSmsRetry(selectedWallet?.id);

  const [selectedWalletId, setSelectedWalletId] = useState<string | undefined>(
    receiverDetails?.wallets?.[0]?.id,
  );

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const stats = receiverDetails?.stats;
  const defaultWalletId = receiverDetails?.wallets?.[0]?.id;

  const resetSmsRetry = () => {
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
    if (selectedWalletId) {
      setSelectedWallet(
        receiverDetails?.wallets.find((w) => w.id === selectedWalletId),
      );
    }
    // We don't want to track receiverDetails here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWalletId]);

  useEffect(() => {
    return () => {
      if (isSmsRetrySuccess || isSmsRetryError) {
        resetSmsRetry();
      }
    };
    // Don't need to include queryClient.resetQueries
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSmsRetryError, isSmsRetrySuccess]);

  const calculateRate = () => {
    if (stats?.paymentsSuccessfulCount && stats?.paymentsTotalCount) {
      return Number(stats.paymentsSuccessfulCount / stats.paymentsTotalCount);
    }

    return 0;
  };

  const setCardTemplateRows = (rows: number) => {
    return {
      "--StatCard-template-rows": rows,
    } as React.CSSProperties;
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
              <label className="StatCards__card__item__label">
                Total received
              </label>
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
              <div className="StatCards__card__item__value">
                {receiverDetails.orgId || "-"}
              </div>
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
                <div className="StatCards__card__unit">{`${percent.format(
                  calculateRate(),
                )}`}</div>
              </div>
            </div>

            <div
              className="StatCards__card__column"
              style={setCardTemplateRows(4)}
            >
              <div className="StatCards__card__item StatCards__card__item--inline">
                <label className="StatCards__card__item__label">
                  Total payments
                </label>
                <div className="StatCards__card__item__value">
                  {renderNumberOrDash(receiverDetails.stats.paymentsTotalCount)}
                </div>
              </div>

              <div className="StatCards__card__item StatCards__card__item--inline">
                <label className="StatCards__card__item__label">
                  Successful payments
                </label>
                <div className="StatCards__card__item__value">
                  {renderNumberOrDash(
                    receiverDetails.stats.paymentsSuccessfulCount,
                  )}
                </div>
              </div>

              <div className="StatCards__card__item StatCards__card__item--inline">
                <label className="StatCards__card__item__label">
                  Failed payments
                </label>
                <div className="StatCards__card__item__value">
                  {renderNumberOrDash(
                    receiverDetails.stats.paymentsFailedCount,
                  )}
                </div>
              </div>

              <div className="StatCards__card__item StatCards__card__item--inline">
                <label className="StatCards__card__item__label">
                  Canceled payments
                </label>
                <div className="StatCards__card__item__value">
                  {renderNumberOrDash(
                    receiverDetails.stats.paymentsCanceledCount,
                  )}
                </div>
              </div>

              <div className="StatCards__card__item StatCards__card__item--inline">
                <label className="StatCards__card__item__label">
                  Remaining payments
                </label>
                <div className="StatCards__card__item__value">
                  {renderNumberOrDash(
                    receiverDetails.stats.paymentsRemainingCount,
                  )}
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
      wallet.stellarAddress
        ? shortenAccountKey(wallet.stellarAddress)
        : "Unregistered"
    })`;
  };

  const renderWallets = () => {
    if (!receiverDetails) {
      return null;
    }

    return (
      <div className="ReceiverDetails__wallets">
        {isSmsRetrySuccess && (
          <NotificationWithButtons
            variant="success"
            title="SMS invitation sent successfully!"
            buttons={[
              {
                label: "Dismiss",
                onClick: () => {
                  resetSmsRetry();
                },
              },
            ]}
          >
            {" "}
          </NotificationWithButtons>
        )}
        {smsRetryError && (
          <NotificationWithButtons
            variant="error"
            title="Error"
            buttons={[
              {
                label: "Dismiss",
                onClick: () => {
                  resetSmsRetry();
                },
              },
            ]}
          >
            {smsRetryError.message}
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
              {renderTextWithCount(
                receiverDetails.wallets.length,
                "wallet",
                "wallets",
              )}
            </div>
          </div>

          <div>
            <Button
              variant="secondary"
              size="xs"
              onClick={(e) => {
                e.preventDefault();
                retrySmsInvite();
              }}
              isLoading={isSmsRetryFetching}
              disabled={Boolean(selectedWallet?.stellarAddress)}
              {...(selectedWallet?.stellarAddress
                ? { title: "This wallet has already been registered" }
                : {})}
            >
              Retry invitation SMS
            </Button>
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
                    <label className="StatCards__card__item__label">
                      Balance
                    </label>
                    <div className="StatCards__card__item__value">
                      <ReceiverWalletBalance
                        stellarAddress={selectedWallet.stellarAddress}
                      />
                    </div>
                  </div>

                  <div className="StatCards__card__item StatCards__card__item--inline">
                    <label className="StatCards__card__item__label">
                      Wallet address
                    </label>
                    <div className="StatCards__card__item__value">
                      {selectedWallet.stellarAddress ? (
                        <Profile
                          size="sm"
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
                    <label className="StatCards__card__item__label">
                      Wallet provider
                    </label>
                    <div className="StatCards__card__item__value">
                      {selectedWallet.provider || "-"}
                    </div>
                  </div>
                </div>

                {/* Column two */}
                <div className="StatCards__card__column">
                  <div className="StatCards__card__item StatCards__card__item--inline">
                    <label className="StatCards__card__item__label">
                      Invited at
                    </label>
                    <div className="StatCards__card__item__value">
                      {formatDateTime(selectedWallet.invitedAt)}
                    </div>
                  </div>

                  <div className="StatCards__card__item StatCards__card__item--inline">
                    <label className="StatCards__card__item__label">
                      Created at
                    </label>
                    <div className="StatCards__card__item__value">
                      {formatDateTime(selectedWallet.createdAt)}
                    </div>
                  </div>

                  <div className="StatCards__card__item StatCards__card__item--inline">
                    <label className="StatCards__card__item__label">
                      SMS last sent
                    </label>
                    <div className="StatCards__card__item__value">
                      {formatDateTime(selectedWallet.smsLastSentAt)}
                    </div>
                  </div>
                </div>

                {/* Column three */}
                <div className="StatCards__card__column">
                  <div className="StatCards__card__item StatCards__card__item--inline">
                    <label className="StatCards__card__item__label">
                      Total payments received
                    </label>
                    <div className="StatCards__card__item__value">
                      {renderNumberOrDash(selectedWallet.totalPaymentsCount)}
                    </div>
                  </div>

                  <div className="StatCards__card__item StatCards__card__item--inline">
                    <label className="StatCards__card__item__label">
                      Total amount received
                    </label>
                    <div className="StatCards__card__item__value">
                      <AssetAmount
                        amount={selectedWallet.totalAmountReceived}
                        assetCode={selectedWallet.assetCode}
                        fallback="-"
                      />
                    </div>
                  </div>

                  <div className="StatCards__card__item StatCards__card__item--inline">
                    <label className="StatCards__card__item__label">
                      Withdrawn amount
                    </label>
                    <div className="StatCards__card__item__value">
                      <AssetAmount
                        amount={selectedWallet.withdrawnAmount}
                        assetCode={selectedWallet.assetCode}
                        fallback="-"
                      />
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

              <ReceiverWalletHistory
                stellarAddress={selectedWallet.stellarAddress}
              />
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
          <div>{receiverDetailsError?.message || GENERIC_ERROR_MESSAGE}</div>
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
                  <CopyWithIcon
                    textToCopy={receiverDetails.phoneNumber}
                    iconSizeRem="1.5"
                  >
                    {receiverDetails.phoneNumber}
                  </CopyWithIcon>
                </Heading>
              </SectionHeader.Content>
              <Button
                variant="secondary"
                size="xs"
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
                <Heading as="h3" size="sm">
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
    </>
  );
};
