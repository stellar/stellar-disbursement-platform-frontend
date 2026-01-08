import { Badge, Heading, Link, Button, Icon, Modal } from "@stellar/design-system";
import { BigNumber } from "bignumber.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DisbursementButtons } from "@/components/DisbursementButtons";
import { DisbursementDetails } from "@/components/DisbursementDetails";
import { DisbursementInstructions } from "@/components/DisbursementInstructions";
import { DisbursementInviteMessage } from "@/components/DisbursementInviteMessage";
import { ErrorWithExtras } from "@/components/ErrorWithExtras";
import { NotificationWithButtons } from "@/components/NotificationWithButtons";
import { SectionHeader } from "@/components/SectionHeader";
import { Toast } from "@/components/Toast";
import { Routes } from "@/constants/settings";
import { csvTotalAmount } from "@/helpers/csvTotalAmount";
import { useAllBalances } from "@/hooks/useAllBalances";
import { useDownloadCsvFile } from "@/hooks/useDownloadCsvFile";
import { useRedux } from "@/hooks/useRedux";
import { AppDispatch } from "@/store";
import {
  getDisbursementDetailsAction,
  setDisbursementDetailsAction,
} from "@/store/ducks/disbursementDetails";
import {
  clearCsvUpdatedAction,
  clearDisbursementDraftsErrorAction,
  confirmDisbursementAction,
  deleteDisbursementDraftAction,
  resetDisbursementDraftsAction,
  saveNewCsvFileAction,
  setDraftIdAction,
  submitDisbursementSavedDraftAction,
} from "@/store/ducks/disbursementDrafts";
import { DisbursementDraft, DisbursementStep, hasWallet } from "@/types";

export const DisbursementDraftDetails = () => {
  const { id: draftId } = useParams();

  const { disbursements, disbursementDrafts, disbursementDetails, organization, profile } =
    useRedux(
      "disbursements",
      "disbursementDrafts",
      "disbursementDetails",
      "organization",
      "profile",
    );

  const [csvFile, setCsvFile] = useState<File>();
  const [isCsvFileUpdated, setIsCsvFileUpdated] = useState(false);
  const [isCsvUpdatedSuccess, setIsCsvUpdatedSuccess] = useState(false);

  const [currentStep, setCurrentStep] = useState<DisbursementStep>("preview");
  const [isDraftInProgress, setIsDraftInProgress] = useState(false);
  const [isResponseSuccess, setIsResponseSuccess] = useState<boolean>(false);

  const [totalAmountOverride, setTotalAmountOverride] = useState<string>();

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading: csvDownloadIsLoading } = useDownloadCsvFile(setCsvFile, true);
  const { allBalances } = useAllBalances();

  const notificationRef = useRef<HTMLDivElement | null>(null);
  const apiError = disbursementDrafts.errorString;
  const isLoading = disbursementDetails.status === "PENDING";

  const currentDraftId = disbursementDetails.details.id;
  const draftDetails: DisbursementDraft = useMemo(() => {
    if (!totalAmountOverride || !disbursementDetails.details.stats) {
      return disbursementDetails;
    }

    return {
      ...disbursementDetails,
      details: {
        ...disbursementDetails.details,
        stats: {
          ...disbursementDetails.details.stats,
          totalAmount: totalAmountOverride,
        },
      },
    };
  }, [disbursementDetails, totalAmountOverride]);
  const isKWA = hasWallet(draftDetails?.details.registrationContactType);

  useEffect(() => {
    if (!apiError && !isCsvUpdatedSuccess && !isResponseSuccess) return;

    notificationRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [apiError, isCsvUpdatedSuccess, isResponseSuccess]);

  const fetchedDisbursementDraft = disbursementDrafts.items.find((p) => p.details.id === draftId);
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
    if (disbursementDetails.details.id || disbursementDetails.status === "PENDING") {
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
    if (currentDraftId) {
      dispatch(setDraftIdAction(currentDraftId));
    }
  }, [currentDraftId, dispatch]);

  // Update future balance when total amount changes
  const futureBalance = useMemo(() => {
    const totalAmount = draftDetails?.details.stats?.totalAmount;
    const assetBalance =
      allBalances?.find((a) => a.assetCode === draftDetails?.details.asset.code)?.balance ?? "0";

    if (!totalAmount) {
      return 0;
    }

    return Number(assetBalance) - BigNumber(totalAmount).toNumber();
  }, [draftDetails?.details.stats?.totalAmount, draftDetails?.details.asset.code, allBalances]);

  const resetState = () => {
    setCurrentStep("edit");
    setTotalAmountOverride(undefined);
    setCsvFile(undefined);
    setIsCsvFileUpdated(false);
    setIsCsvUpdatedSuccess(false);
    setIsDraftInProgress(false);
    setIsResponseSuccess(false);
    dispatch(resetDisbursementDraftsAction());
  };

  const handleSaveDraft = async () => {
    if (!draftId || !csvFile) {
      return;
    }

    try {
      await dispatch(saveNewCsvFileAction({ savedDraftId: draftId, file: csvFile })).unwrap();
      setIsDraftInProgress(true);
      setIsCsvFileUpdated(false);
      setIsCsvUpdatedSuccess(true);
      dispatch(getDisbursementDetailsAction(draftId));
    } catch {
      // errors handled via redux notifications
    }
  };

  const handleCsvFileChange = (file?: File) => {
    setIsCsvUpdatedSuccess(false);
    if (apiError) {
      dispatch(clearDisbursementDraftsErrorAction());
    }
    updateTotalAmount(file);
    setCsvFile(file);
    setIsCsvFileUpdated(true);
    dispatch(clearCsvUpdatedAction());
  };

  const updateTotalAmount = (csvFile?: File) => {
    csvTotalAmount({ csvFile }).then((totalAmount) => {
      if (!totalAmount || !currentDraftId || !draftDetails.details.stats) return;

      setTotalAmountOverride(totalAmount.toString());
    });
  };

  const handleGoBackToDrafts = () => {
    navigate(-1);
    resetState();
  };

  const handleSubmitDisbursement = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draftDetails || !csvFile) {
      return;
    }

    try {
      if (isCsvFileUpdated) {
        await dispatch(
          submitDisbursementSavedDraftAction({
            savedDraftId: draftId,
            details: draftDetails.details,
            file: csvFile,
          }),
        ).unwrap();
        // reset all save draft status
        setIsDraftInProgress(false);
        setIsCsvFileUpdated(false);
        setIsCsvUpdatedSuccess(false);

        // switch to confirmation view with success banner
        setCurrentStep("confirmation");
        setIsResponseSuccess(true);
        dispatch(clearCsvUpdatedAction());
      } else {
        await dispatch(
          confirmDisbursementAction({
            savedDraftId: draftId,
          }),
        ).unwrap();
      }
    } catch {
      // errors handled via redux notifications
    }
  };

  const handleViewDetails = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();
    navigate(`${Routes.DISBURSEMENTS}/${disbursementDetails.details.id}`);
    resetState();
  };

  const hasUserWorkedOnThisDraft = () => {
    return Boolean(
      disbursementDetails.details.statusHistory.find((h) => h.userId === profile.data.id),
    );
  };

  const handleDeleteDraft = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (draftId) {
      dispatch(deleteDisbursementDraftAction(draftId));
      setIsDeleteModalVisible(false);
      navigate(Routes.DISBURSEMENT_DRAFTS);
    }
  };

  const showDeleteModal = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    setIsDeleteModalVisible(true);
  };

  const hideDeleteModal = (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event?.preventDefault();
    setIsDeleteModalVisible(false);
  };

  const renderButtons = (variant: DisbursementStep) => {
    const canUserSubmit = organization.data.isApprovalRequired
      ? // If approval is required, a different user must submit the draft
        !isCsvFileUpdated && !hasUserWorkedOnThisDraft()
      : true;

    let tooltip;

    if (isCsvFileUpdated) {
      tooltip = "Please save your changes as a draft before confirming the disbursement";
    } else if (!canUserSubmit) {
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
          !(Boolean(draftDetails) && Boolean(csvFile) && canUserSubmit) || futureBalance < 0
        }
        isDraftPending={disbursementDrafts.status === "PENDING"}
        actionType={disbursementDrafts.actionType}
        tooltip={tooltip}
        isCsvFileUpdated={isCsvFileUpdated}
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

    const successMessageArray: string[] = [
      "Payments will begin automatically",
      isKWA ? "" : " to receivers who have registered their wallet",
      ". Click 'View' to track your disbursement in real-time.",
    ].filter((m) => Boolean(m));

    // Confirmation
    if (currentStep === "confirmation") {
      return (
        <>
          {isResponseSuccess ? (
            <NotificationWithButtons
              ref={notificationRef}
              variant="success"
              title="New disbursement was successfully created"
            >
              <div>{successMessageArray.join("")}</div>

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
            </NotificationWithButtons>
          ) : null}

          <form className="DisbursementForm">
            <DisbursementDetails
              variant="confirmation"
              details={draftDetails?.details}
              futureBalance={futureBalance}
              csvFile={csvFile}
            />
            {!isKWA && (
              <DisbursementInviteMessage
                isEditMessage={false}
                draftMessage={draftDetails?.details.receiverRegistrationMessageTemplate}
              />
            )}
            {renderButtons("confirmation")}
          </form>
        </>
      );
    }

    return (
      <>
        {isCsvUpdatedSuccess ? (
          <NotificationWithButtons ref={notificationRef} variant="success" title="CSV updated">
            <div>
              Your file was updated successfully. Make sure to confirm your disbursement to start
              it.
            </div>

            <div className="Notification__buttons">
              <Link role="button" onClick={() => setIsCsvUpdatedSuccess(false)}>
                Dismiss
              </Link>
            </div>
          </NotificationWithButtons>
        ) : null}
        <form onSubmit={handleSubmitDisbursement} className="DisbursementForm">
          <DisbursementDetails
            variant="preview"
            details={draftDetails?.details}
            futureBalance={futureBalance}
          />
          {!isKWA && (
            <DisbursementInviteMessage
              isEditMessage={false}
              draftMessage={draftDetails?.details.receiverRegistrationMessageTemplate}
            />
          )}
          <DisbursementInstructions
            variant={"preview"}
            csvFile={csvFile}
            onChange={handleCsvFileChange}
            registrationContactType={draftDetails?.details.registrationContactType}
            verificationField={draftDetails?.details.verificationField}
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
            <Toast isVisible={isDraftInProgress} setIsVisible={setIsDraftInProgress}>
              <Badge variant="tertiary">Changes saved</Badge>
            </Toast>
            <Button
              variant="error"
              size="md"
              icon={<Icon.Trash01 />}
              onClick={showDeleteModal}
              isLoading={disbursementDrafts.status === "PENDING"}
            >
              Delete Draft
            </Button>
          </SectionHeader.Content>
        </SectionHeader.Row>
      </SectionHeader>

      {apiError ? (
        <NotificationWithButtons
          ref={notificationRef}
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
        </NotificationWithButtons>
      ) : null}

      {renderContent()}

      <Modal visible={isDeleteModalVisible} onClose={hideDeleteModal}>
        <Modal.Heading>Delete draft permanently?</Modal.Heading>
        <Modal.Body>
          <div>
            Clicking 'Delete draft' will permanently remove this draft and cannot be undone.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            size="md"
            variant="tertiary"
            onClick={hideDeleteModal}
            isLoading={disbursementDrafts.status === "PENDING"}
          >
            Not now
          </Button>
          <Button
            size="md"
            variant="error"
            onClick={(event) => handleDeleteDraft(event)}
            isLoading={disbursementDrafts.status === "PENDING"}
          >
            Delete draft
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
