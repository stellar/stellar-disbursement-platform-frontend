import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  Heading,
  Icon,
  Notification,
  Select,
  Link,
  Modal,
} from "@stellar/design-system";
import { useDispatch } from "react-redux";

import { AppDispatch } from "store";
import {
  getDisbursementDetailsAction,
  getDisbursementReceiversAction,
  pauseOrStartDisbursementAction,
  setDisbursementDetailsAction,
} from "store/ducks/disbursementDetails";
import { useRedux } from "hooks/useRedux";
import {
  PAGE_LIMIT_OPTIONS,
  Routes,
  STELLAR_EXPERT_URL,
} from "constants/settings";

import { Breadcrumbs } from "components/Breadcrumbs";
import { SectionHeader } from "components/SectionHeader";
import { CopyWithIcon } from "components/CopyWithIcon";
import { formatDateTime } from "helpers/formatIntlDateTime";
import { AssetAmount } from "components/AssetAmount";
import { Pagination } from "components/Pagination";
import { Table } from "components/Table";
import { renderNumberOrDash } from "helpers/renderNumberOrDash";
import { number } from "helpers/formatIntlNumber";
import { PaymentStatus } from "components/PaymentStatus";
import { saveFile } from "helpers/saveFile";
import { useDownloadCsvFile } from "hooks/useDownloadCsvFile";

export const DisbursementDetails = () => {
  const { id: disbursementId } = useParams();

  const { disbursements, disbursementDetails } = useRedux(
    "disbursements",
    "disbursementDetails",
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading: csvDownloadIsLoading, getFile } = useDownloadCsvFile(
    (file: File) => {
      saveFile({
        file,
        suggestedFileName: disbursementDetails.details.fileName || "",
      });
    },
  );

  const fetchedDisbursement = disbursements.items.find(
    (p) => p.id === disbursementId,
  );

  const maxPages =
    disbursementDetails.details.receivers?.pagination?.pages || 1;
  const isPaused = disbursementDetails.details.status === "PAUSED";

  const saveDisbursementDetails = useCallback(() => {
    if (fetchedDisbursement) {
      dispatch(
        setDisbursementDetailsAction({
          details: fetchedDisbursement,
          instructions: {
            csvFile: undefined,
            csvName: undefined,
          },
        }),
      );
    }
  }, [dispatch, fetchedDisbursement]);

  useEffect(() => {
    if (fetchedDisbursement?.id) {
      saveDisbursementDetails();
    } else if (disbursementId) {
      dispatch(getDisbursementDetailsAction(disbursementId));
    }
  }, [
    disbursementId,
    dispatch,
    fetchedDisbursement?.id,
    saveDisbursementDetails,
  ]);

  useEffect(() => {
    if (disbursementDetails.details.id) {
      dispatch(getDisbursementReceiversAction());
    }
  }, [disbursementDetails.details.id, dispatch]);

  const handleDownloadFile = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();
    getFile();
  };

  const handlePageLimitChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    event.preventDefault();

    const pageLimit = Number(event.target.value);
    setPageLimit(pageLimit);
    setCurrentPage(1);

    // Need to make sure we'll be loading page 1
    dispatch(
      getDisbursementReceiversAction({
        page_limit: pageLimit.toString(),
        page: "1",
      }),
    );
  };

  const goToReceiver = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    receiverId: string,
  ) => {
    event.preventDefault();
    navigate(`${Routes.RECEIVERS}/${receiverId}`);
  };

  const showModal = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();
    setIsModalVisible(true);
  };

  const hideModal = (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event?.preventDefault();
    setIsModalVisible(false);
  };

  const handlePauseOrRestart = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    status: "PAUSED" | "STARTED",
  ) => {
    event.preventDefault();
    dispatch(pauseOrStartDisbursementAction(status));
    setIsModalVisible(false);
  };

  const renderStatCards = () => {
    return (
      <div className="StatCards StatCards--disbursementDetails">
        <Card>
          <div className="StatCards__card StatCards__card--grid">
            <div className="StatCards__card__item">
              <label className="StatCards__card__item__label">
                No. of receivers
              </label>
              <div className="StatCards__card__item__value">
                {renderNumberOrDash(
                  disbursementDetails.details.stats?.paymentsTotalCount,
                )}
              </div>
            </div>

            <div className="StatCards__card__item">
              <label className="StatCards__card__item__label">Created at</label>
              <div className="StatCards__card__item__value">
                {formatDateTime(disbursementDetails.details.createdAt)}
              </div>
            </div>

            <div className="StatCards__card__item StatCards__card__item--fullWidth">
              <label className="StatCards__card__item__label">
                Disbursement ID
              </label>
              <div className="StatCards__card__item__value">
                <CopyWithIcon
                  textToCopy={disbursementDetails.details.id}
                  iconSizeRem="0.875"
                >
                  {disbursementDetails.details.id}
                </CopyWithIcon>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div
            className="StatCards__card StatCards__card--grid StatCards__card--wideGap"
            style={{ "--StatCard-template-rows": 4 } as React.CSSProperties}
          >
            <div className="StatCards__card__column">
              <div className="StatCards__card__item StatCards__card__item--inline">
                <label className="StatCards__card__item__label">
                  Receivers SMS was sent to
                </label>
                <div className="StatCards__card__item__value">
                  {renderNumberOrDash(
                    disbursementDetails.details.stats?.paymentsTotalCount,
                  )}
                </div>
              </div>

              <div className="StatCards__card__item StatCards__card__item--inline">
                <label className="StatCards__card__item__label">
                  Successful payments
                </label>
                <div className="StatCards__card__item__value">
                  {renderNumberOrDash(
                    disbursementDetails.details.stats?.paymentsSuccessfulCount,
                  )}
                </div>
              </div>

              <div className="StatCards__card__item StatCards__card__item--inline">
                <label className="StatCards__card__item__label">
                  Failed payments
                </label>
                <div className="StatCards__card__item__value">
                  {renderNumberOrDash(
                    disbursementDetails.details.stats?.paymentsFailedCount,
                  )}
                </div>
              </div>

              <div className="StatCards__card__item StatCards__card__item--inline">
                <label className="StatCards__card__item__label">
                  Remaining payments
                </label>
                <div className="StatCards__card__item__value">
                  {renderNumberOrDash(
                    disbursementDetails.details.stats?.paymentsRemainingCount,
                  )}
                </div>
              </div>
            </div>

            <div className="StatCards__card__column">
              <div className="StatCards__card__item StatCards__card__item--inline">
                <label className="StatCards__card__item__label">
                  Total amount
                </label>
                <div className="StatCards__card__item__value">
                  <AssetAmount
                    assetCode={disbursementDetails.details.asset.code}
                    amount={disbursementDetails.details.stats?.totalAmount}
                    fallback="-"
                  />
                </div>
              </div>

              <div className="StatCards__card__item StatCards__card__item--inline">
                <label className="StatCards__card__item__label">
                  Amount disbursed
                </label>
                <div className="StatCards__card__item__value">
                  <AssetAmount
                    assetCode={disbursementDetails.details.asset.code}
                    amount={disbursementDetails.details.stats?.disbursedAmount}
                    fallback="-"
                  />
                </div>
              </div>

              <div className="StatCards__card__item StatCards__card__item--inline">
                <label className="StatCards__card__item__label">
                  Average payment amount
                </label>
                <div className="StatCards__card__item__value">
                  <AssetAmount
                    assetCode={disbursementDetails.details.asset.code}
                    amount={
                      disbursementDetails.details.stats?.averagePaymentAmount
                    }
                    fallback="-"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderReceivers = () => {
    if (
      !disbursementDetails.details.receivers ||
      disbursementDetails.details.receivers.items.length === 0
    ) {
      return <div className="Note">There are no receivers</div>;
    }

    return (
      <div className="FiltersWithSearch">
        <Card noPadding>
          <Table>
            <Table.Header>
              {/* TODO: put back once ready */}
              {/* <Table.HeaderCell>
              <Checkbox id="disbursement-receivers-select-all" fieldSize="xs" />
            </Table.HeaderCell> */}
              <Table.HeaderCell>Phone number</Table.HeaderCell>
              <Table.HeaderCell>Wallet provider</Table.HeaderCell>
              <Table.HeaderCell textAlign="right">Amount</Table.HeaderCell>
              <Table.HeaderCell>Completed at</Table.HeaderCell>
              <Table.HeaderCell>Blockchain ID</Table.HeaderCell>
              <Table.HeaderCell textAlign="right">Org ID</Table.HeaderCell>
              <Table.HeaderCell textAlign="right">
                Payment status
              </Table.HeaderCell>
            </Table.Header>

            <Table.Body>
              {disbursementDetails.details.receivers.items.map((r) => (
                <Table.BodyRow key={`${r.id}-${r.provider}-${r.orgId}`}>
                  {/* TODO: put back once ready */}
                  {/* <Table.BodyCell width="1rem">
                  <Checkbox id={`receiver-${r.id}`} fieldSize="xs" />
                </Table.BodyCell> */}
                  <Table.BodyCell title={r.phoneNumber} width="7.25rem">
                    <Link onClick={(event) => goToReceiver(event, r.id)}>
                      {r.phoneNumber}
                    </Link>
                  </Table.BodyCell>
                  <Table.BodyCell width="8rem">{r.provider}</Table.BodyCell>
                  <Table.BodyCell textAlign="right" width="7.5rem">
                    <AssetAmount
                      amount={r.amount}
                      assetCode={r.assetCode}
                      fallback="-"
                    />
                  </Table.BodyCell>
                  <Table.BodyCell width="9.375rem">
                    {r.completedAt ? (
                      <span className="Table-v2__cell--secondary">
                        {formatDateTime(r.completedAt)}
                      </span>
                    ) : null}
                  </Table.BodyCell>
                  <Table.BodyCell textAlign="right" width="7.5rem">
                    {r.blockchainId ? (
                      <Link href={`${STELLAR_EXPERT_URL}/tx/${r.blockchainId}`}>
                        {r.blockchainId}
                      </Link>
                    ) : null}
                  </Table.BodyCell>
                  <Table.BodyCell textAlign="right" width="7.5rem">
                    {r.orgId}
                  </Table.BodyCell>
                  <Table.BodyCell textAlign="right" width="8.5rem">
                    <PaymentStatus status={r.paymentStatus} />
                  </Table.BodyCell>
                </Table.BodyRow>
              ))}
            </Table.Body>
          </Table>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    if (disbursementDetails.errorString) {
      return (
        <Notification variant="error" title="Error">
          {disbursementDetails.errorString}
        </Notification>
      );
    }

    if (
      !disbursementDetails.details.id &&
      disbursementDetails.status === "PENDING"
    ) {
      return <div className="Note">Loading…</div>;
    }

    if (!disbursementId || !disbursementDetails.details.id) {
      return null;
    }

    return (
      <>
        {isPaused ? (
          <div className="SectionBlock">
            <Notification variant="error" title="Disbursement paused">
              Payments are on hold until the disbursement is started again.
            </Notification>
          </div>
        ) : null}

        <SectionHeader>
          <SectionHeader.Row>
            <SectionHeader.Content>
              <Heading as="h2" size="sm">
                <CopyWithIcon
                  textToCopy={disbursementDetails.details.name}
                  iconSizeRem="1.5"
                >
                  {disbursementDetails.details.name}
                </CopyWithIcon>
              </Heading>
            </SectionHeader.Content>

            <SectionHeader.Content align="right">
              {isPaused ? (
                <Button
                  variant="success"
                  size="sm"
                  icon={<Icon.ChevronDoubleRight />}
                  onClick={showModal}
                  isLoading={disbursementDetails.status === "PENDING"}
                >
                  Start
                </Button>
              ) : (
                <Button
                  variant="error"
                  size="sm"
                  icon={<Icon.Block />}
                  onClick={showModal}
                  isLoading={disbursementDetails.status === "PENDING"}
                  disabled={disbursementDetails.details.status !== "STARTED"}
                >
                  Pause
                </Button>
              )}

              <Button
                variant="secondary"
                size="sm"
                icon={<Icon.Download />}
                onClick={handleDownloadFile}
                isLoading={csvDownloadIsLoading}
                disabled={!disbursementDetails.details.fileName}
              >
                Download file
              </Button>
            </SectionHeader.Content>
          </SectionHeader.Row>
        </SectionHeader>

        {renderStatCards()}

        <SectionHeader>
          <SectionHeader.Row>
            <SectionHeader.Content>
              <Heading as="h3" size="sm">
                {disbursementDetails.details.receivers?.pagination?.total &&
                disbursementDetails.details.receivers?.pagination.total > 0
                  ? `${number.format(
                      disbursementDetails.details.receivers.pagination.total,
                    )} `
                  : ""}
                Receivers
              </Heading>
            </SectionHeader.Content>

            <SectionHeader.Content align="right">
              <div className="FiltersWithSearch__pageLimit">
                <Select
                  id="disbursement-receivers-page-limit"
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
                onSetPage={(page) => {
                  setCurrentPage(page);
                  dispatch(
                    getDisbursementReceiversAction({ page: page.toString() }),
                  );
                }}
                isLoading={disbursementDetails.status === "PENDING"}
              />
            </SectionHeader.Content>
          </SectionHeader.Row>
        </SectionHeader>

        {renderReceivers()}
      </>
    );
  };

  return (
    <>
      <Breadcrumbs
        steps={[
          {
            label: "Disbursements",
            route: Routes.DISBURSEMENTS,
          },
          {
            label: "Disbursement details",
          },
        ]}
      />

      {renderContent()}

      <Modal visible={isModalVisible} onClose={hideModal}>
        {isPaused ? (
          <>
            <Modal.Heading>Restart disbursement</Modal.Heading>
            <Modal.Body>
              <div>
                Click Confirm to restart the disbursement. All remaining
                payments will be made automatically to registered receivers.
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                size="sm"
                variant="secondary"
                onClick={hideModal}
                isLoading={disbursementDetails.status === "PENDING"}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="success"
                onClick={(event) => handlePauseOrRestart(event, "STARTED")}
                isLoading={disbursementDetails.status === "PENDING"}
              >
                Confirm
              </Button>
            </Modal.Footer>
          </>
        ) : (
          <>
            <Modal.Heading>Pause disbursement</Modal.Heading>
            <Modal.Body>
              <div>
                Click Confirm to pause all payments still remaining in this
                disbursement. The disbursement can be restarted afterwards.
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                size="sm"
                variant="secondary"
                onClick={hideModal}
                isLoading={disbursementDetails.status === "PENDING"}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="error"
                onClick={(event) => handlePauseOrRestart(event, "PAUSED")}
                isLoading={disbursementDetails.status === "PENDING"}
              >
                Confirm
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </>
  );
};
