import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  Heading,
  Icon,
  Link,
  Modal,
  Notification,
  Profile,
} from "@stellar/design-system";

import { usePaymentsPaymentId } from "apiQueries/usePaymentsPaymentId";
import { useCancelPayment } from "apiQueries/useCancelPayment";
import { useReceiversReceiverId } from "apiQueries/useReceiversReceiverId";
import { STELLAR_EXPERT_URL } from "constants/envVariables";
import { Routes, CANCELED_PAYMENT_STATUS, READY_PAYMENT_STATUS } from "constants/settings";
import { formatDateTime, formatDateTimeWithSeconds } from "helpers/formatIntlDateTime";
import { shortenString } from "helpers/shortenString";
import { formatPaymentDetails } from "helpers/formatPaymentDetails";
import {
  getReceiverContactInfoTitle,
  renderReceiverContactInfoItems,
} from "helpers/receiverContactInfo";

import { Breadcrumbs } from "components/Breadcrumbs";
import { SectionHeader } from "components/SectionHeader";
import { Table } from "components/Table";
import { PaymentStatus } from "components/PaymentStatus";
import { ReceiverStatus } from "components/ReceiverStatus";
import { AssetAmount } from "components/AssetAmount";
import { MultipleAmounts } from "components/MultipleAmounts";
import { RetryFailedPayment } from "components/RetryFailedPayment";
import { ErrorWithExtras } from "components/ErrorWithExtras";

import { PaymentDetailsReceiver } from "types";

// TODO: handle loading/fetching state (create component that handles it
// everywhere)

export const PaymentDetails = () => {
  const { id: paymentId } = useParams();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const {
    data: payment,
    error: paymentError,
    refetch: refetchPayment,
  } = usePaymentsPaymentId(paymentId);

  const {
    error: cancelPaymentError,
    isSuccess: isCancelPaymentSuccess,
    isError: isCancelPaymentError,
    isPending: isCancelPaymentPending,
    mutateAsync: cancelPayment,
  } = useCancelPayment();

  const formattedPayment = payment ? formatPaymentDetails(payment) : null;

  const { data: receiver } = useReceiversReceiverId<PaymentDetailsReceiver>({
    receiverId: payment?.receiver_wallet?.receiver?.id,
    dataFormat: "paymentReceiver",
    receiverWalletId: formattedPayment?.receiverWalletId,
  });

  const navigate = useNavigate();

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

  const showModal = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    setIsModalVisible(true);
  };

  const hideModal = (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event?.preventDefault();
    setIsModalVisible(false);
  };

  const handleCancelPayment = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (formattedPayment) {
      cancelPayment({ paymentId: formattedPayment.id });
    }
    setIsModalVisible(false);
  };

  useEffect(() => {
    if (isCancelPaymentSuccess || isCancelPaymentError) {
      hideModal();
    }

    if (isCancelPaymentSuccess) {
      refetchPayment();
    }
  }, [isCancelPaymentSuccess, isCancelPaymentError, refetchPayment]);

  const renderContent = () => {
    if (paymentError) {
      return (
        <Notification variant="error" title="Error">
          <ErrorWithExtras
            appError={{
              message: `Error fetching payment details: ${paymentError.message}`,
            }}
          />
        </Notification>
      );
    }

    if (formattedPayment) {
      return (
        <>
          {formattedPayment.status === CANCELED_PAYMENT_STATUS && (
            <div className="SectionBlock">
              <Notification variant="error" title="Payment canceled">
                This payment is permanently canceled.
              </Notification>
            </div>
          )}

          {cancelPaymentError && (
            <Notification variant="error" title="Error">
              {cancelPaymentError.message}
            </Notification>
          )}

          <div className="DetailsSection">
            <RetryFailedPayment
              paymentId={formattedPayment.id}
              paymentStatus={formattedPayment.status}
            />

            <SectionHeader>
              <SectionHeader.Row>
                <SectionHeader.Content>
                  <Heading as="h2" size="sm">
                    {paymentId}
                  </Heading>
                </SectionHeader.Content>

                <Button
                  variant="error"
                  size="sm"
                  icon={<Icon.SlashCircle01 />}
                  onClick={showModal}
                  disabled={formattedPayment.status !== READY_PAYMENT_STATUS}
                >
                  Cancel
                </Button>
              </SectionHeader.Row>
            </SectionHeader>

            <div className="StatCards StatCards--paymentDetails">
              <Card>
                <div className="PaymentDetails__wrapper">
                  <div className="PaymentDetails__info">
                    <label className="Label">Created at</label>
                    <div>{formatDateTimeWithSeconds(formattedPayment.createdAt)}</div>
                  </div>

                  <div className="PaymentDetails__info">
                    <label className="Label">Disbursement name</label>
                    <div>
                      <Link
                        onClick={(event) =>
                          goToDisbursement(event, formattedPayment.disbursementId)
                        }
                      >
                        {formattedPayment.disbursementName}
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
                        amount={formattedPayment.totalAmount}
                        assetCode={formattedPayment.assetCode}
                        fallback="-"
                      />
                    </div>
                  </div>

                  <div className="PaymentDetails__info">
                    <label className="Label">Stellar transaction ID</label>
                    <div>
                      {formattedPayment.transactionId ? (
                        <Link
                          href={`${STELLAR_EXPERT_URL}/tx/${formattedPayment.transactionId}`}
                          title={formattedPayment.transactionId}
                        >
                          {shortenString(formattedPayment.transactionId, 15)}
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
                      {formattedPayment.senderAddress ? (
                        <Profile
                          publicAddress={formattedPayment.senderAddress}
                          size="md"
                          isCopy
                          isShort
                          hideAvatar
                        />
                      ) : (
                        "-"
                      )}
                    </div>
                  </div>

                  <div className="PaymentDetails__info">
                    <label className="Label">External Payment ID</label>
                    <div>
                      {formattedPayment.externalPaymentId
                        ? formattedPayment.externalPaymentId.length > 20
                          ? shortenString(formattedPayment.externalPaymentId, 10)
                          : formattedPayment.externalPaymentId
                        : "-"}
                    </div>
                  </div>

                  {formattedPayment.circleTransferRequestId ? (
                    <div className="PaymentDetails__info">
                      <label className="Label">Circle Transfer ID</label>
                      <div>{formattedPayment.circleTransferRequestId}</div>
                    </div>
                  ) : null}
                </div>
              </Card>
            </div>
          </div>

          {/* Status history */}
          <div className="DetailsSection">
            <Heading as="h2" size="xs">
              Status history
            </Heading>

            <Card noPadding>
              <Table>
                <Table.Header>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Message</Table.HeaderCell>
                  <Table.HeaderCell textAlign="right">Updated at</Table.HeaderCell>
                </Table.Header>

                <Table.Body>
                  {formattedPayment.statusHistory.map((h) => (
                    <Table.BodyRow key={h.updatedAt}>
                      <Table.BodyCell>
                        <PaymentStatus status={h.status} />
                      </Table.BodyCell>
                      <Table.BodyCell title={h.message}>
                        <span className="Table-v2__cell--secondary">{h.message || "-"}</span>
                      </Table.BodyCell>
                      <Table.BodyCell textAlign="right">
                        <span className="Table-v2__cell--secondary">
                          {formatDateTimeWithSeconds(h.updatedAt)}
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
            <Heading as="h2" size="xs">
              Receiver
            </Heading>

            <Card noPadding>
              <Table isScrollable={true}>
                <Table.Header>
                  {/* TODO: put back once ready */}
                  {/* <Table.HeaderCell>
                <Checkbox
                  id="payment-details-receiver-select-all"
                  fieldSize="xs"
                />
              </Table.HeaderCell> */}
                  <Table.HeaderCell>Contact info</Table.HeaderCell>
                  <Table.HeaderCell>Wallet address</Table.HeaderCell>
                  <Table.HeaderCell>Wallet provider</Table.HeaderCell>
                  <Table.HeaderCell width="5.5rem" textAlign="right">
                    Total payments
                  </Table.HeaderCell>
                  <Table.HeaderCell width="5.5rem" textAlign="right">
                    Successful
                  </Table.HeaderCell>
                  <Table.HeaderCell>Created at</Table.HeaderCell>
                  <Table.HeaderCell textAlign="right">Amount(s) received</Table.HeaderCell>
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
                    <Table.BodyCell
                      wrap={true}
                      title={getReceiverContactInfoTitle(receiver?.phoneNumber, receiver?.email)}
                    >
                      {receiver?.phoneNumber || receiver?.email ? (
                        <Link onClick={(event) => goToReceiverDetails(event, receiver.id)}>
                          {renderReceiverContactInfoItems(receiver?.phoneNumber, receiver?.email)}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </Table.BodyCell>
                    <Table.BodyCell width="7.5rem" allowOverflow>
                      {receiver?.walletAddress ? (
                        <Profile
                          publicAddress={receiver.walletAddress}
                          size="md"
                          isCopy
                          isShort
                          hideAvatar
                        />
                      ) : (
                        "-"
                      )}
                    </Table.BodyCell>
                    <Table.BodyCell width="6rem">{receiver?.provider || "-"}</Table.BodyCell>
                    <Table.BodyCell width="5.5rem" textAlign="right">
                      {receiver?.totalPaymentsCount || "-"}
                    </Table.BodyCell>
                    <Table.BodyCell width="5.5rem" textAlign="right">
                      {receiver?.successfulPaymentsCount || "-"}
                    </Table.BodyCell>
                    <Table.BodyCell width="10rem">
                      <span className="Table-v2__cell--secondary">
                        {receiver?.createdAt ? formatDateTime(receiver.createdAt) : "-"}
                      </span>
                    </Table.BodyCell>
                    <Table.BodyCell textAlign="right">
                      <MultipleAmounts amounts={receiver?.amountsReceived || []} />
                    </Table.BodyCell>
                    <Table.BodyCell textAlign="right">
                      {receiver?.status ? <ReceiverStatus status={receiver.status} /> : "-"}
                    </Table.BodyCell>
                  </Table.BodyRow>
                </Table.Body>
              </Table>
            </Card>
          </div>
        </>
      );
    }

    return null;
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

      <Modal visible={isModalVisible} onClose={hideModal}>
        <Modal.Heading>Cancel payment permanently?</Modal.Heading>
        <Modal.Body>
          <div>
            Clicking 'Cancel payment' will prevent this payment from being processed even if the
            receiver tries to claim funds.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            size="md"
            variant="tertiary"
            onClick={hideModal}
            isLoading={isCancelPaymentPending}
          >
            Not now
          </Button>
          <Button
            size="md"
            variant="error"
            onClick={(event) => handleCancelPayment(event)}
            isLoading={isCancelPaymentPending}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
