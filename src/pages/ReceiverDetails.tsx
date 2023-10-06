import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Card,
  Heading,
  Notification,
  Profile,
  Select,
  Button,
} from "@stellar/design-system";

import { AppDispatch } from "store";
import {
  getReceiverDetailsAction,
  resetRetryStatusAction,
  retryInvitationSMSAction,
} from "store/ducks/receiverDetails";
import {
  getReceiverPaymentsAction,
  getReceiverPaymentsWithParamsAction,
} from "store/ducks/receiverPayments";
import { useRedux } from "hooks/useRedux";
import { PAGE_LIMIT_OPTIONS, Routes } from "constants/settings";

import { Breadcrumbs } from "components/Breadcrumbs";
import { SectionHeader } from "components/SectionHeader";
import { CopyWithIcon } from "components/CopyWithIcon";
import { AssetAmount } from "components/AssetAmount";
import { InfoTooltip } from "components/InfoTooltip";
import { PaymentsTable } from "components/PaymentsTable";
import { Pagination } from "components/Pagination";
import { ReceiverWalletBalance } from "components/ReceiverWalletBalance";
import { ReceiverWalletHistory } from "components/ReceiverWalletHistory";
import { NotificationWithButtons } from "components/NotificationWithButtons";

import { number, percent } from "helpers/formatIntlNumber";
import { renderNumberOrDash } from "helpers/renderNumberOrDash";
import { formatDateTime } from "helpers/formatIntlDateTime";
import { shortenAccountKey } from "helpers/shortenAccountKey";
import { ReceiverWallet } from "types";

export const ReceiverDetails = () => {
  const { id: receiverId } = useParams();

  const { receiverDetails, receiverPayments } = useRedux(
    "receiverDetails",
    "receiverPayments",
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [selectedWallet, setSelectedWallet] = useState<ReceiverWallet>();

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const { stats } = receiverDetails;
  const maxPages = receiverPayments.pagination?.pages || 1;
  const defaultWallet = receiverDetails.wallets?.[0];

  useEffect(() => {
    if (receiverId) {
      dispatch(getReceiverDetailsAction(receiverId));
      dispatch(getReceiverPaymentsAction(receiverId));
    }
  }, [receiverId, dispatch]);

  useEffect(() => {
    setSelectedWallet(defaultWallet);
  }, [defaultWallet]);

  const calculateRate = () => {
    if (stats?.paymentsSuccessfulCount && stats?.paymentsTotalCount) {
      return Number(stats.paymentsSuccessfulCount / stats.paymentsTotalCount);
    }

    return 0;
  };

  const handlePageLimitChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    event.preventDefault();

    const pageLimit = Number(event.target.value);
    setPageLimit(pageLimit);
    setCurrentPage(1);

    if (receiverId) {
      // Need to make sure we'll be loading page 1
      dispatch(
        getReceiverPaymentsWithParamsAction({
          receiver_id: receiverId,
          page_limit: pageLimit.toString(),
          page: "1",
        }),
      );
    }
  };

  const handlePageChange = (currentPage: number) => {
    if (receiverId) {
      dispatch(
        getReceiverPaymentsWithParamsAction({
          receiver_id: receiverId,
          page: currentPage.toString(),
        }),
      );
    }
  };

  const handleNextPage = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();
    const newPage = currentPage + 1;

    setCurrentPage(newPage);
    handlePageChange(newPage);
  };

  const handlePrevPage = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();
    const newPage = currentPage - 1;

    setCurrentPage(newPage);
    handlePageChange(newPage);
  };

  const handleRetryInvitation = (receiverWalletId: string) => {
    dispatch(retryInvitationSMSAction({ receiverWalletId }));
  };

  const setCardTemplateRows = (rows: number) => {
    return {
      "--StatCard-template-rows": rows,
    } as React.CSSProperties;
  };

  const renderInfoCards = () => {
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

  const renderTitle = (
    itemCount: number,
    singularText: string,
    pluralText: string,
  ) => {
    if (itemCount === 1) {
      return `1 ${singularText}`;
    } else if (itemCount > 1) {
      return `${number.format(itemCount)} ${pluralText}`;
    }

    return pluralText;
  };

  const renderWalletOptionText = (wallet: ReceiverWallet) => {
    return `${wallet.provider} (${
      wallet.stellarAddress
        ? shortenAccountKey(wallet.stellarAddress)
        : "Unregistered"
    })`;
  };

  const renderWallets = () => {
    return (
      <div className="ReceiverDetails__wallets">
        {receiverDetails.retryInvitationStatus === "SUCCESS" && (
          <NotificationWithButtons
            variant="success"
            title="SMS invitation sent successfully!"
            buttons={[
              {
                label: "Dismiss",
                onClick: () => {
                  dispatch(resetRetryStatusAction());
                },
              },
            ]}
          >
            {" "}
          </NotificationWithButtons>
        )}
        {receiverDetails.retryInvitationStatus === "ERROR" && (
          <NotificationWithButtons
            variant="error"
            title="Error"
            buttons={[
              {
                label: "Dismiss",
                onClick: () => {
                  dispatch(resetRetryStatusAction());
                },
              },
            ]}
          >
            {receiverDetails.errorString}
          </NotificationWithButtons>
        )}
        <div className="ReceiverDetails__wallets__row">
          <div className="ReceiverDetails__wallets__dropdown">
            <Select
              fieldSize="sm"
              id="receiver-wallets"
              value={selectedWallet?.id}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedWallet(
                  receiverDetails.wallets.find(
                    (w) => w.id === event.currentTarget.value,
                  ),
                )
              }
            >
              {receiverDetails.wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {renderWalletOptionText(w)}
                </option>
              ))}
            </Select>

            <div className="ReceiverDetails__wallets__subtitle">
              {renderTitle(receiverDetails.wallets.length, "wallet", "wallets")}
            </div>
          </div>

          <div>
            <Button
              variant="secondary"
              size="xs"
              type="reset"
              onClick={(e) => {
                e.preventDefault();
                handleRetryInvitation(selectedWallet?.id || "");
              }}
            >
              Retry Invitation SMS
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
    if (
      receiverDetails.errorString &&
      receiverDetails.retryInvitationStatus !== "ERROR"
    ) {
      return (
        <Notification variant="error" title="Error">
          {receiverDetails.errorString}
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

        <div className="DetailsSection">
          <SectionHeader>
            <SectionHeader.Row>
              <SectionHeader.Content>
                <Heading as="h3" size="sm">
                  {renderTitle(
                    receiverPayments.pagination?.total || 0,
                    "Payment",
                    "Payments",
                  )}
                </Heading>
              </SectionHeader.Content>

              <SectionHeader.Content align="right">
                <div className="FiltersWithSearch__pageLimit">
                  <Select
                    id="receiver-payments-page-limit"
                    fieldSize="sm"
                    value={pageLimit}
                    onChange={handlePageLimitChange}
                  >
                    {PAGE_LIMIT_OPTIONS.map((p) => (
                      <option key={p} value={p}>{`Show ${p} results`}</option>
                    ))}
                  </Select>
                </div>

                <Pagination
                  currentPage={Number(currentPage)}
                  maxPages={Number(maxPages)}
                  onChange={(event) => {
                    event.preventDefault();
                    setCurrentPage(Number(event.target.value));
                  }}
                  onBlur={handlePageChange}
                  onNext={handleNextPage}
                  onPrevious={handlePrevPage}
                  isLoading={receiverPayments.status === "PENDING"}
                />
              </SectionHeader.Content>
            </SectionHeader.Row>
          </SectionHeader>

          <PaymentsTable
            paymentItems={receiverPayments.items}
            apiError={receiverPayments.errorString}
            isFiltersSelected={undefined}
            status={receiverPayments.status}
          />
        </div>
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
