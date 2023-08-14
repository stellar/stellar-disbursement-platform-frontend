import { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Heading,
  Link,
  Notification,
  Profile,
} from "@stellar/design-system";
import { useDispatch } from "react-redux";

import { AppDispatch } from "store";
import {
  getPaymentDetailsAction,
  getPaymentDetailsReceiverAction,
  setPaymentDetailsAction,
} from "store/ducks/paymentDetails";
import { Routes, STELLAR_EXPERT_URL } from "constants/settings";
import { formatDateTime } from "helpers/formatIntlDateTime";
import { shortenString } from "helpers/shortenString";
import { useRedux } from "hooks/useRedux";

import { Breadcrumbs } from "components/Breadcrumbs";
import { SectionHeader } from "components/SectionHeader";
import { Table } from "components/Table";
import { PaymentStatus } from "components/PaymentStatus";
import { ReceiverStatus } from "components/ReceiverStatus";
import { AssetAmount } from "components/AssetAmount";
import { MultipleAmounts } from "components/MultipleAmounts";
import { RetryFailedPayment } from "components/RetryFailedPayment";

export const PaymentDetails = () => {
  const { id: paymentId } = useParams();
  const { payments, paymentDetails } = useRedux("payments", "paymentDetails");

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const fetchedPayment = payments.items.find((p) => p.id === paymentId);
  const { receiver } = paymentDetails;

  const savePaymentDetails = useCallback(() => {
    if (fetchedPayment) {
      dispatch(setPaymentDetailsAction(fetchedPayment));
    }
  }, [dispatch, fetchedPayment]);

  // TODO: once we have data for the whole flow, figure out when to clear payment details

  useEffect(() => {
    if (fetchedPayment?.id) {
      savePaymentDetails();
    } else {
      if (paymentId) {
        dispatch(getPaymentDetailsAction(paymentId));
      }
    }
  }, [paymentId, fetchedPayment?.id, savePaymentDetails, dispatch]);

  useEffect(() => {
    if (paymentDetails.details.receiverId) {
      dispatch(
        getPaymentDetailsReceiverAction(paymentDetails.details.receiverId),
      );
    }
  }, [paymentDetails.details.receiverId, dispatch]);

  const goToDisbursement = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    disbursementId: string,
  ) => {
    event.preventDefault();
    navigate(`${Routes.DISBURSEMENTS}/${disbursementId}`);
  };

  const goToReceiverDetails = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    receiverId: string,
  ) => {
    event?.preventDefault();
    navigate(`${Routes.RECEIVERS}/${receiverId}`);
  };

  const renderContent = () => {
    if (paymentDetails.errorString) {
      return (
        <Notification variant="error" title="Error">
          {paymentDetails.errorString}
        </Notification>
      );
    }

    return (
      <>
        <div className="DetailsSection">
          <RetryFailedPayment
            paymentId={paymentDetails.details.id}
            paymentStatus={paymentDetails.statusHistory}
            onSuccess={() => {
              dispatch(getPaymentDetailsAction(paymentDetails.details.id));
            }}
          />

          <SectionHeader>
            <SectionHeader.Row>
              <SectionHeader.Content>
                <Heading as="h2" size="sm">
                  {paymentId}
                </Heading>
              </SectionHeader.Content>
            </SectionHeader.Row>
          </SectionHeader>

          <div className="StatCards StatCards--paymentDetails">
            <Card>
              <div className="PaymentDetails__wrapper">
                <div className="PaymentDetails__info">
                  <label className="Label">Created at</label>
                  <div>{formatDateTime(paymentDetails.details.createdAt)}</div>
                </div>

                <div className="PaymentDetails__info">
                  <label className="Label">Disbursement name</label>
                  <div>
                    <Link
                      onClick={(event) =>
                        goToDisbursement(
                          event,
                          paymentDetails.details.disbursementId,
                        )
                      }
                    >
                      {paymentDetails.details.disbursementName}
                    </Link>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="PaymentDetails__wrapper">
                <div className="PaymentDetails__info">
                  <label className="Label">Amount</label>
                  <div>
                    <AssetAmount
                      amount={paymentDetails.details.totalAmount}
                      assetCode={paymentDetails.details.assetCode}
                      fallback="-"
                    />
                  </div>
                </div>

                <div className="PaymentDetails__info">
                  <label className="Label">Stellar transaction ID</label>
                  <div>
                    {paymentDetails.details.transactionId ? (
                      <Link
                        href={`${STELLAR_EXPERT_URL}/tx/${paymentDetails.details.transactionId}`}
                        title={paymentDetails.details.transactionId}
                      >
                        {shortenString(
                          paymentDetails.details.transactionId,
                          15,
                        )}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="PaymentDetails__wrapper">
                <div className="PaymentDetails__info">
                  <label className="Label">Sender</label>
                  <div>
                    {paymentDetails.details.senderAddress ? (
                      <Profile
                        publicAddress={paymentDetails.details.senderAddress}
                        size="sm"
                        isCopy
                        isShort
                        hideAvatar
                      />
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Status history */}
        <div className="DetailsSection">
          <Heading as="h2" size="sm">
            Status history
          </Heading>

          <Card noPadding>
            <Table>
              <Table.Header>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Message</Table.HeaderCell>
                <Table.HeaderCell textAlign="right">
                  Updated at
                </Table.HeaderCell>
              </Table.Header>

              <Table.Body>
                {paymentDetails.statusHistory.map((h) => (
                  <Table.BodyRow key={h.updatedAt}>
                    <Table.BodyCell>
                      <PaymentStatus status={h.status} />
                    </Table.BodyCell>
                    <Table.BodyCell title={h.message}>
                      <span className="Table-v2__cell--secondary">
                        {h.message || "-"}
                      </span>
                    </Table.BodyCell>
                    <Table.BodyCell textAlign="right">
                      <span className="Table-v2__cell--secondary">
                        {formatDateTime(h.updatedAt)}
                      </span>
                    </Table.BodyCell>
                  </Table.BodyRow>
                ))}
              </Table.Body>
            </Table>
          </Card>
        </div>

        {/* Receiver */}
        <div className="DetailsSection">
          <Heading as="h2" size="sm">
            Receiver
          </Heading>

          <Card noPadding>
            <Table>
              <Table.Header>
                {/* TODO: put back once ready */}
                {/* <Table.HeaderCell>
                <Checkbox
                  id="payment-details-receiver-select-all"
                  fieldSize="xs"
                />
              </Table.HeaderCell> */}
                <Table.HeaderCell>Phone number</Table.HeaderCell>
                <Table.HeaderCell>Wallet address</Table.HeaderCell>
                <Table.HeaderCell>Wallet provider</Table.HeaderCell>
                <Table.HeaderCell width="5.5rem" textAlign="right">
                  Total payments
                </Table.HeaderCell>
                <Table.HeaderCell width="5.5rem" textAlign="right">
                  Successful
                </Table.HeaderCell>
                <Table.HeaderCell>Created at</Table.HeaderCell>
                <Table.HeaderCell textAlign="right">
                  Amount(s) received
                </Table.HeaderCell>
                <Table.HeaderCell textAlign="right">Status</Table.HeaderCell>
              </Table.Header>

              <Table.Body>
                <Table.BodyRow>
                  {/* TODO: put back once ready */}
                  {/* <Table.BodyCell width="1rem">
                  <Checkbox
                    id="payment-details-receiver-select"
                    fieldSize="xs"
                  />
                </Table.BodyCell> */}
                  <Table.BodyCell width="7.5rem" title={receiver?.phoneNumber}>
                    {receiver?.phoneNumber ? (
                      <Link
                        onClick={(event) =>
                          goToReceiverDetails(event, receiver.id)
                        }
                      >
                        {receiver.phoneNumber}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </Table.BodyCell>
                  <Table.BodyCell width="7.5rem" allowOverflow>
                    {receiver?.walletAddress ? (
                      <Profile
                        publicAddress={receiver.walletAddress}
                        size="sm"
                        isCopy
                        isShort
                        hideAvatar
                      />
                    ) : (
                      "-"
                    )}
                  </Table.BodyCell>
                  <Table.BodyCell width="6rem">
                    {receiver?.provider || "-"}
                  </Table.BodyCell>
                  <Table.BodyCell width="5.5rem" textAlign="right">
                    {receiver?.totalPaymentsCount || "-"}
                  </Table.BodyCell>
                  <Table.BodyCell width="5.5rem" textAlign="right">
                    {receiver?.successfulPaymentsCount || "-"}
                  </Table.BodyCell>
                  <Table.BodyCell width="9.375rem">
                    <span className="Table-v2__cell--secondary">
                      {receiver?.createdAt
                        ? formatDateTime(receiver.createdAt)
                        : "-"}
                    </span>
                  </Table.BodyCell>
                  <Table.BodyCell textAlign="right">
                    <MultipleAmounts
                      amounts={receiver?.amountsReceived || []}
                    />
                  </Table.BodyCell>
                  <Table.BodyCell textAlign="right">
                    {receiver?.status ? (
                      <ReceiverStatus status={receiver.status} />
                    ) : (
                      "-"
                    )}
                  </Table.BodyCell>
                </Table.BodyRow>
              </Table.Body>
            </Table>
          </Card>
        </div>
      </>
    );
  };

  return (
    <>
      <Breadcrumbs
        steps={[
          {
            label: "Payments",
            route: Routes.PAYMENTS,
          },
          {
            label: "Payment details",
          },
        ]}
      />

      {renderContent()}
    </>
  );
};
