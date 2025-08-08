import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, Heading, Icon, Link, Notification } from "@stellar/design-system";

import { Routes } from "constants/settings";
import { formatDateTime } from "helpers/formatIntlDateTime";
import { formatRegistrationContactType } from "helpers/formatRegistrationContactType";
import { useRedux } from "hooks/useRedux";
import { AppDispatch } from "store";
import { getDisbursementDraftsAction, setDraftIdAction } from "store/ducks/disbursementDrafts";
import { resetDisbursementDetailsAction } from "store/ducks/disbursementDetails";

import { Breadcrumbs } from "components/Breadcrumbs";
import { NewDisbursementButton } from "components/NewDisbursementButton";
import { SectionHeader } from "components/SectionHeader";
import { Table } from "components/Table";
import { ErrorWithExtras } from "components/ErrorWithExtras";
import { DisbursementDraft } from "types";

export const DisbursementsDrafts = () => {
  const { disbursementDrafts } = useRedux("disbursementDrafts");

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!disbursementDrafts.status || disbursementDrafts.actionType) {
      dispatch(getDisbursementDraftsAction());
      dispatch(resetDisbursementDetailsAction());
      dispatch(setDraftIdAction(undefined));
    }
  }, [disbursementDrafts.actionType, disbursementDrafts.status, dispatch]);

  const apiError = disbursementDrafts.status === "ERROR" && disbursementDrafts.errorString;
  const isLoading =
    disbursementDrafts.items.length === 0 && disbursementDrafts.status === "PENDING";
  const doneLoading = disbursementDrafts.status && disbursementDrafts.status !== "PENDING";
  const hasData = doneLoading && disbursementDrafts.items.length > 0;

  const handleEditDraft = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    item: DisbursementDraft,
  ) => {
    event.preventDefault();
    navigate(`${Routes.DISBURSEMENT_DRAFTS}/${item.details.id}`);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="Note">Loading…</div>;
    }

    return (
      <>
        {/* TODO: add sorting by name and created at */}
        {hasData ? (
          <div className="DisbursementDrafts">
            <Card noPadding>
              <Table>
                <Table.Header>
                  <Table.HeaderCell>Disbursement name</Table.HeaderCell>
                  <Table.HeaderCell>Registration Contact Type</Table.HeaderCell>
                  <Table.HeaderCell>Asset</Table.HeaderCell>
                  <Table.HeaderCell>Created at</Table.HeaderCell>
                  <Table.HeaderCell> </Table.HeaderCell>
                </Table.Header>

                <Table.Body>
                  {disbursementDrafts.items.map((item: DisbursementDraft) => {
                    const formattedDate = formatDateTime(item.details.createdAt);

                    return (
                      <Table.BodyRow key={item.details.id}>
                        <Table.BodyCell width="8.2rem">
                          <Link
                            onClick={(event) => handleEditDraft(event, item)}
                            title={item.details.name}
                          >
                            {item.details.name}
                          </Link>
                        </Table.BodyCell>
                        <Table.BodyCell width="5rem" title={item.details.registrationContactType}>
                          {formatRegistrationContactType(item.details.registrationContactType)}
                        </Table.BodyCell>
                        <Table.BodyCell width="3.5rem" title={item.details.asset.code}>
                          {item.details.asset.code}
                        </Table.BodyCell>
                        <Table.BodyCell width="150px" title={formattedDate}>
                          <span className="Table-v2__cell--secondary">{formattedDate}</span>
                        </Table.BodyCell>
                        <Table.BodyCell textAlign="right">
                          {item.details.fileName ? (
                            <span className="DisbursementDrafts__icon" title="CSV uploaded">
                              <Icon.Attachment01 />
                            </span>
                          ) : null}
                        </Table.BodyCell>
                      </Table.BodyRow>
                    );
                  })}
                </Table.Body>
              </Table>
            </Card>
          </div>
        ) : apiError ? null : (
          <div className="Note">There are no saved drafts</div>
        )}
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
            label: "Disbursement drafts",
          },
        ]}
      />

      <SectionHeader>
        <SectionHeader.Row>
          <SectionHeader.Content>
            <Heading as="h2" size="sm">
              Disbursement drafts
            </Heading>
          </SectionHeader.Content>

          <SectionHeader.Content align="right">
            <NewDisbursementButton />
          </SectionHeader.Content>
        </SectionHeader.Row>
      </SectionHeader>

      {apiError ? (
        <Notification variant="error" title="Error">
          <ErrorWithExtras
            appError={{
              message: apiError,
            }}
          />
        </Notification>
      ) : null}

      {renderContent()}
    </>
  );
};
