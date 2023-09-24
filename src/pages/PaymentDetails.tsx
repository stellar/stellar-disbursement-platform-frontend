import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Heading,
  Link,
  Notification,
  Profile,
} from "@stellar/design-system";

import { usePaymentsPaymentId } from "apiQueries/usePaymentsPaymentId";
import { useReceiversReceiverId } from "apiQueries/useReceiversReceiverId";
import { Routes, STELLAR_EXPERT_URL } from "constants/settings";
import { formatDateTime } from "helpers/formatIntlDateTime";
import { shortenString } from "helpers/shortenString";
import { formatPaymentReceiver } from "helpers/formatPaymentReceiver";
import { formatPaymentDetails } from "helpers/formatPaymentDetails";

import { Breadcrumbs } from "components/Breadcrumbs";
import { SectionHeader } from "components/SectionHeader";
import { Table } from "components/Table";
import { PaymentStatus } from "components/PaymentStatus";
import { ReceiverStatus } from "components/ReceiverStatus";
import { AssetAmount } from "components/AssetAmount";
import { MultipleAmounts } from "components/MultipleAmounts";
import { RetryFailedPayment } from "components/RetryFailedPayment";

// TODO: handle loading/fetching state (create component that handles it
// everywhere)

export const PaymentDetails = () => {
  const { id: paymentId } = useParams();

  const { data: payment, error: paymentError } =
    usePaymentsPaymentId(paymentId);

  const { data: receiver } = useReceiversReceiverId(
    payment?.receiver_wallet?.receiver?.id,
  );

  const formattedPayment = payment ? formatPaymentDetails(payment) : null;
  const formattedReceiver = receiver
    ? formatPaymentReceiver(receiver, formattedPayment?.receiverWalletId)
    : null;

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

  const renderContent = () => {
    if (paymentError) {
      return (
        <Notification variant="error" title="Error">
          {`Error fetching payment details: ${paymentError.message}`}
        </Notification>
      );
    }

    if (formattedPayment) {
      return (
        <>
          <div className="DetailsSection">
            <RetryFailedPayment
              paymentId={formattedPayment.id}
              paymentStatus={formattedPayment.statusHistory}
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
                    <div>{formatDateTime(formattedPayment.createdAt)}</div>
                  </div>

                  <div className="PaymentDetails__info">
                    <label className="Label">Disbursement name</label>
                    <div>
                      <Link
                        onClick={(event) =>
                          goToDisbursement(
                            event,
                            formattedPayment.disbursementId,
                          )
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
                  {formattedPayment.statusHistory.map((h) => (
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
                    <Table.BodyCell
                      width="7.5rem"
                      title={formattedReceiver?.phoneNumber}
                    >
                      {formattedReceiver?.phoneNumber ? (
                        <Link
                          onClick={(event) =>
                            goToReceiverDetails(event, formattedReceiver.id)
                          }
                        >
                          {formattedReceiver.phoneNumber}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </Table.BodyCell>
                    <Table.BodyCell width="7.5rem" allowOverflow>
                      {formattedReceiver?.walletAddress ? (
                        <Profile
                          publicAddress={formattedReceiver.walletAddress}
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
                      {formattedReceiver?.provider || "-"}
                    </Table.BodyCell>
                    <Table.BodyCell width="5.5rem" textAlign="right">
                      {formattedReceiver?.totalPaymentsCount || "-"}
                    </Table.BodyCell>
                    <Table.BodyCell width="5.5rem" textAlign="right">
                      {formattedReceiver?.successfulPaymentsCount || "-"}
                    </Table.BodyCell>
                    <Table.BodyCell width="9.375rem">
                      <span className="Table-v2__cell--secondary">
                        {formattedReceiver?.createdAt
                          ? formatDateTime(formattedReceiver.createdAt)
                          : "-"}
                      </span>
                    </Table.BodyCell>
                    <Table.BodyCell textAlign="right">
                      <MultipleAmounts
                        amounts={formattedReceiver?.amountsReceived || []}
                      />
                    </Table.BodyCell>
                    <Table.BodyCell textAlign="right">
                      {formattedReceiver?.status ? (
                        <ReceiverStatus status={formattedReceiver.status} />
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
    </>
  );
};
