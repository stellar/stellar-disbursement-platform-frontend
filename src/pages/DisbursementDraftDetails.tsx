import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge, Heading, Link, Notification } from "@stellar/design-system";
import { useDispatch } from "react-redux";
import { useRedux } from "hooks/useRedux";
import { useDownloadCsvFile } from "hooks/useDownloadCsvFile";

import { AppDispatch } from "store";
import {
  getDisbursementDetailsAction,
  setDisbursementDetailsAction,
} from "store/ducks/disbursementDetails";
import {
  clearCsvUpdatedAction,
  clearDisbursementDraftsErrorAction,
  resetDisbursementDraftsAction,
  saveNewCsvFileAction,
  setDraftIdAction,
  submitDisbursementSavedDraftAction,
} from "store/ducks/disbursementDrafts";

import { Breadcrumbs } from "components/Breadcrumbs";
import { Routes } from "constants/settings";
import { SectionHeader } from "components/SectionHeader";
import { Toast } from "components/Toast";
import { DisbursementDetails } from "components/DisbursementDetails";
import { DisbursementInviteMessage } from "components/DisbursementInviteMessage";
import { DisbursementInstructions } from "components/DisbursementInstructions";
import { DisbursementButtons } from "components/DisbursementButtons";
import { ErrorWithExtras } from "components/ErrorWithExtras";

import { DisbursementDraft, DisbursementStep } from "types";

export const DisbursementDraftDetails = () => {
  const { id: draftId } = useParams();

  const {
    disbursements,
    disbursementDrafts,
    disbursementDetails,
    organization,
    profile,
  } = useRedux(
    "disbursements",
    "disbursementDrafts",
    "disbursementDetails",
    "organization",
    "profile",
  );

  const [draftDetails, setDraftDetails] = useState<DisbursementDraft>();
  const [customMessage, setCustomMessage] = useState("");
  const [csvFile, setCsvFile] = useState<File>();
  const [isCsvFileUpdated, setIsCsvFileUpdated] = useState(false);
  const [isCsvUpdatedSuccess, setIsCsvUpdatedSuccess] = useState(false);

  const [currentStep, setCurrentStep] = useState<DisbursementStep>("preview");
  const [isDraftInProgress, setIsDraftInProgress] = useState(false);
  const [isResponseSuccess, setIsResponseSuccess] = useState<boolean>(false);

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading: csvDownloadIsLoading } = useDownloadCsvFile(
    setCsvFile,
    true,
  );

  const apiError = disbursementDrafts.errorString;
  const isLoading = disbursementDetails.status === "PENDING";

  const fetchedDisbursementDraft = disbursementDrafts.items.find(
    (p) => p.details.id === draftId,
  );
  const fetchedDisbursement = disbursements.items.find((p) => p.id === draftId);

  const saveDisbursementDetails = useCallback(() => {
    if (fetchedDisbursementDraft) {
      dispatch(setDisbursementDetailsAction(fetchedDisbursementDraft));
    } else if (fetchedDisbursement) {
      dispatch(
        setDisbursementDetailsAction({
          details: fetchedDisbursement,
          instructions: { csvFile: undefined, csvName: undefined },
        }),
      );
    }
  }, [dispatch, fetchedDisbursement, fetchedDisbursementDraft]);

  useEffect(() => {
    if (
      disbursementDetails.details.id ||
      disbursementDetails.status === "PENDING"
    ) {
      return;
    }

    if (fetchedDisbursement?.id) {
      saveDisbursementDetails();
    } else if (draftId) {
      dispatch(getDisbursementDetailsAction(draftId));
    }
  }, [
    draftId,
    fetchedDisbursement?.id,
    saveDisbursementDetails,
    dispatch,
    disbursementDetails.details.id,
    disbursementDetails.status,
  ]);

  useEffect(() => {
    setDraftDetails(disbursementDetails);
    dispatch(setDraftIdAction(disbursementDetails.details.id));
  }, [disbursementDetails, dispatch]);

  useEffect(() => {
    if (
      disbursementDrafts.newDraftId &&
      disbursementDrafts.status === "SUCCESS"
    ) {
      // Show success response page
      if (disbursementDrafts.actionType === "submit") {
        setCurrentStep("confirmation");
        setIsResponseSuccess(true);
      }
    }

    return () => {
      setIsResponseSuccess(false);
      dispatch(clearCsvUpdatedAction());
    };
  }, [
    disbursementDrafts.actionType,
    disbursementDrafts.newDraftId,
    disbursementDrafts.status,
    dispatch,
  ]);

  useEffect(() => {
    if (
      disbursementDrafts.isCsvFileUpdated &&
      disbursementDrafts.status === "SUCCESS"
    ) {
      setIsDraftInProgress(false);
      setIsCsvFileUpdated(false);
      setIsCsvUpdatedSuccess(true);

      if (draftId) {
        dispatch(getDisbursementDetailsAction(draftId));
      }
    }
  }, [
    disbursementDrafts.isCsvFileUpdated,
    disbursementDrafts.status,
    dispatch,
    draftId,
  ]);

  const resetState = () => {
    setCurrentStep("edit");
    setDraftDetails(undefined);
    setCsvFile(undefined);
    setIsCsvFileUpdated(false);
    setIsResponseSuccess(false);
    dispatch(resetDisbursementDraftsAction());
  };

  const handleSaveDraft = () => {
    if (draftId && csvFile) {
      dispatch(saveNewCsvFileAction({ savedDraftId: draftId, file: csvFile }));
      setIsDraftInProgress(true);
    }
  };

  const handleGoBackToDrafts = () => {
    navigate(-1);
    resetState();
  };

  const handleSubmitDisbursement = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (draftDetails && csvFile) {
      dispatch(
        submitDisbursementSavedDraftAction({
          savedDraftId: draftId,
          details: {
            ... draftDetails.details,
            smsRegistrationMessageTemplate: customMessage,
          },
          file: csvFile,
        }),
      );
    }
  };

  const handleViewDetails = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    event.preventDefault();
    navigate(`${Routes.DISBURSEMENTS}/${disbursementDetails.details.id}`);
    resetState();
  };

  const hasUserWorkedOnThisDraft = () => {
    return Boolean(
      disbursementDetails.details.statusHistory.find(
        (h) => h.userId === profile.data.id,
      ),
    );
  };

  const renderButtons = (variant: DisbursementStep) => {
    const canUserSubmit = organization.data.isApprovalRequired
      ? // If approval is required, a different user must submit the draft
        !isCsvFileUpdated && !hasUserWorkedOnThisDraft()
      : true;

    let tooltip;

    if (!canUserSubmit) {
      tooltip =
        "Your organization requires disbursements to be approved by another user. Save as a draft and make sure another user reviews and submits.";
    }

    return (
      <DisbursementButtons
        variant={variant}
        onSaveDraft={handleSaveDraft}
        onGoBack={handleGoBackToDrafts}
        onGoToDrafts={handleGoBackToDrafts}
        clearDrafts={() => {
          dispatch(resetDisbursementDraftsAction());
        }}
        isDraftDisabled={!isCsvFileUpdated}
        isSubmitDisabled={
          !(Boolean(draftDetails) && Boolean(csvFile) && canUserSubmit)
        }
        isDraftPending={disbursementDrafts.status === "PENDING"}
        actionType={disbursementDrafts.actionType}
        tooltip={tooltip}
      />
    );
  };

  const renderContent = () => {
    if (isLoading || csvDownloadIsLoading) {
      return <div className="Note">Loading…</div>;
    }

    if (!["READY", "DRAFT"].includes(disbursementDetails.details.status)) {
      return (
        <div className="Note">{`Disbursement ID ${disbursementDetails.details.id} is not a draft. Current status is ${disbursementDetails.details.status}.`}</div>
      );
    }

    // Confirmation
    if (currentStep === "confirmation") {
      return (
        <>
          {isResponseSuccess ? (
            <Notification
              variant="success"
              title="New disbursement was successfully created"
            >
              <div>
                Payments will begin automatically to receivers who have
                registered their wallet. Click View to track your disbursement
                in real-time.
              </div>

              <div className="Notification__buttons">
                <Link role="button" onClick={handleViewDetails}>
                  View
                </Link>
                <Link
                  role="button"
                  onClick={() => {
                    setIsResponseSuccess(false);
                  }}
                >
                  Dismiss
                </Link>
              </div>
            </Notification>
          ) : null}

          <form className="DisbursementForm">
            <DisbursementDetails
              variant="confirmation"
              details={draftDetails?.details}
              csvFile={csvFile}
            />
            <DisbursementInviteMessage
              disbursementInviteMessage={draftDetails?.details.smsRegistrationMessageTemplate || ""}
              isEditMessage={false}
              onChange={(updatedDisbursementInviteMessage) => {
                setCustomMessage(updatedDisbursementInviteMessage)
              }}
            />
            {renderButtons("confirmation")}
          </form>
        </>
      );
    }

    return (
      <>
        {isCsvUpdatedSuccess ? (
          <Notification variant="success" title="CSV updated">
            <div>
              Your file was updated successfully. Make sure to confirm your
              disbursement to start it.
            </div>

            <div className="Notification__buttons">
              <Link
                role="button"
                onClick={() => {
                  setIsCsvUpdatedSuccess(false);
                }}
              >
                Dismiss
              </Link>
            </div>
          </Notification>
        ) : null}
        <form onSubmit={handleSubmitDisbursement} className="DisbursementForm">
          <DisbursementDetails
            variant="preview"
            details={draftDetails?.details}
          />
          <DisbursementInviteMessage
            disbursementInviteMessage={draftDetails?.details.smsRegistrationMessageTemplate || ""}
            isEditMessage={false}
            onChange={(updatedDisbursementInviteMessage) => {
              setCustomMessage(updatedDisbursementInviteMessage)
            }}
          />
          <DisbursementInstructions
            variant={"preview"}
            csvFile={csvFile}
            onChange={(file) => {
              if (apiError) {
                dispatch(clearDisbursementDraftsErrorAction());
              }
              setCsvFile(file);
              setIsCsvFileUpdated(true);
              dispatch(clearCsvUpdatedAction());
            }}
          />

          {renderButtons("preview")}
        </form>
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
              Disbursement draft
            </Heading>
          </SectionHeader.Content>

          <SectionHeader.Content align="right">
            <Toast
              isVisible={isDraftInProgress}
              setIsVisible={setIsDraftInProgress}
            >
              <Badge variant="pending">Changes saved</Badge>
            </Toast>
          </SectionHeader.Content>
        </SectionHeader.Row>
      </SectionHeader>

      {apiError ? (
        <Notification
          variant="error"
          title={
            disbursementDrafts.actionType === "submit"
              ? "There was an error creating your disbursement"
              : "Error"
          }
        >
          <ErrorWithExtras
            appError={{
              message: apiError,
              extras: disbursementDrafts.errorExtras,
            }}
          />
        </Notification>
      ) : null}

      {renderContent()}
    </>
  );
};
