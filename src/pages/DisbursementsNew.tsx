import { useEffect, useRef, useState } from "react";
import { Badge, Card, Heading } from "@stellar/design-system";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BigNumber } from "bignumber.js";

import { AppDispatch } from "store";
import {
  clearDisbursementDraftsErrorAction,
  resetDisbursementDraftsAction,
  saveDisbursementDraftAction,
  submitDisbursementNewDraftAction,
} from "store/ducks/disbursementDrafts";
import { useRedux } from "hooks/useRedux";
import { useAllBalances } from "hooks/useAllBalances";
import { Routes } from "constants/settings";
import { csvTotalAmount } from "helpers/csvTotalAmount";

import { Breadcrumbs } from "components/Breadcrumbs";
import { SectionHeader } from "components/SectionHeader";
import { Toast } from "components/Toast";
import { DisbursementDetails } from "components/DisbursementDetails";
import { DisbursementInviteMessage } from "components/DisbursementInviteMessage";
import { DisbursementInstructions } from "components/DisbursementInstructions";
import { DisbursementButtons } from "components/DisbursementButtons";
import { NotificationWithButtons } from "components/NotificationWithButtons";
import { InfoTooltip } from "components/InfoTooltip";
import { AccountBalances } from "components/AccountBalances";
import { ErrorWithExtras } from "components/ErrorWithExtras";
import { Title } from "components/Title";

import { Disbursement, DisbursementStep, hasWallet } from "types";

export const DisbursementsNew = () => {
  const { disbursementDrafts, organization } = useRedux("disbursementDrafts", "organization");

  const [draftDetails, setDraftDetails] = useState<Disbursement>();
  const [customMessage, setCustomMessage] = useState("");
  const [isDetailsValid, setIsDetailsValid] = useState(false);
  const [csvFile, setCsvFile] = useState<File | undefined>();
  const [futureBalance, setFutureBalance] = useState(0);

  const [currentStep, setCurrentStep] = useState<DisbursementStep>("edit");
  const [isDraftInProgress, setIsDraftInProgress] = useState(false);
  const [isSavedDraftMessageVisible, setIsSavedDraftMessageVisible] = useState(false);
  const [isResponseSuccess, setIsResponseSuccess] = useState<boolean>(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  const isDraftEnabled = isDetailsValid;
  const isReviewEnabled = isDraftEnabled && Boolean(csvFile);

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const apiError = disbursementDrafts.status === "ERROR" && disbursementDrafts.errorString;

  useEffect(() => {
    if (!apiError && !isSavedDraftMessageVisible && !isResponseSuccess) return;

    notificationRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isSavedDraftMessageVisible, apiError, isResponseSuccess]);

  useEffect(() => {
    handleScrollToTop();
    if (disbursementDrafts.newDraftId && disbursementDrafts.status === "SUCCESS") {
      // Show success response page
      if (disbursementDrafts.actionType === "submit") {
        setCurrentStep("confirmation");
        setIsResponseSuccess(true);

        setIsSavedDraftMessageVisible(false);
      }

      // Show message and toast when draft is saved
      if (disbursementDrafts.actionType === "save") {
        setIsSavedDraftMessageVisible(true);
        setIsDraftInProgress(true);
      }
    }
  }, [disbursementDrafts.actionType, disbursementDrafts.newDraftId, disbursementDrafts.status]);

  const { allBalances } = useAllBalances();

  const resetState = () => {
    setCurrentStep("edit");
    setDraftDetails(undefined);
    setIsDetailsValid(false);
    setCsvFile(undefined);
    setIsResponseSuccess(false);
    dispatch(resetDisbursementDraftsAction());
  };

  const handleDiscard = () => {
    dispatch(resetDisbursementDraftsAction());
    navigate(Routes.DISBURSEMENTS);
  };

  // TODO: figure out how to disable save if nothing has changed
  const handleSaveDraft = async () => {
    setIsSavedDraftMessageVisible(false);

    if (draftDetails) {
      dispatch(
        saveDisbursementDraftAction({
          details: {
            ...draftDetails,
            receiverRegistrationMessageTemplate: customMessage,
          },
          file: csvFile,
        }),
      );
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReview = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCurrentStep("preview");
    setIsSavedDraftMessageVisible(false);
  };

  const handleGoBackToEdit = () => {
    dispatch(clearDisbursementDraftsErrorAction());
    setCurrentStep("edit");
  };

  const handleSubmitDisbursement = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleScrollToTop();
    if (draftDetails && csvFile) {
      dispatch(
        submitDisbursementNewDraftAction({
          details: {
            ...draftDetails,
            receiverRegistrationMessageTemplate: customMessage,
          },
          file: csvFile,
        }),
      );
    }
  };

  const handleStartNewDisbursement = () => {
    resetState();
  };

  const handleCsvFileChange = (file?: File) => {
    if (apiError) {
      dispatch(clearDisbursementDraftsErrorAction());
    }
    calculateDisbursementTotalAmountFromFile(file);
    setCsvFile(file);
  };

  const calculateDisbursementTotalAmountFromFile = (csvFile?: File) => {
    csvTotalAmount({ csvFile }).then((totalAmount) => {
      if (!totalAmount) return;

      setDraftDetails({
        ...draftDetails,
        stats: {
          ...draftDetails?.stats,
          totalAmount: totalAmount?.toString() ?? "0",
        },
      } as Disbursement);

      // update future balance
      const assetBalance =
        allBalances?.find((a) => a.assetCode === draftDetails?.asset.code)?.balance ?? "0";

      if (totalAmount) {
        setFutureBalance(Number(assetBalance) - totalAmount.toNumber());
      }
    });
  };

  const handleViewDetails = () => {
    navigate(`${Routes.DISBURSEMENTS}/${disbursementDrafts.newDraftId}`);
    resetState();
  };

  const renderButtons = (variant: DisbursementStep) => {
    return (
      <DisbursementButtons
        variant={variant}
        onDiscard={handleDiscard}
        onSaveDraft={handleSaveDraft}
        onGoBack={handleGoBackToEdit}
        onNewDisbursement={handleStartNewDisbursement}
        clearDrafts={() => {
          dispatch(resetDisbursementDraftsAction());
        }}
        isDraftDisabled={
          !isDraftEnabled || Boolean(disbursementDrafts.newDraftId && currentStep === "preview")
        }
        isSubmitDisabled={
          organization.data.isApprovalRequired ||
          !(draftDetails && csvFile) ||
          BigNumber(futureBalance).lt(0)
        }
        isReviewDisabled={!isReviewEnabled}
        isDraftPending={disbursementDrafts.status === "PENDING"}
        actionType={disbursementDrafts.actionType}
        tooltip={
          organization.data.isApprovalRequired
            ? "Your organization requires disbursements to be approved by another user. Save as a draft and make sure another user reviews and submits."
            : undefined
        }
      />
    );
  };

  const renderCurrentStep = () => {
    // Preview
    if (currentStep === "preview") {
      return (
        <form onSubmit={handleSubmitDisbursement} className="DisbursementForm">
          <DisbursementDetails
            variant="preview"
            details={draftDetails}
            futureBalance={futureBalance}
          />
          <DisbursementInviteMessage isEditMessage={false} draftMessage={customMessage} />
          <DisbursementInstructions
            variant="preview"
            csvFile={csvFile}
            onChange={handleCsvFileChange}
            registrationContactType={draftDetails?.registrationContactType}
            verificationField={draftDetails?.verificationField}
          />

          {renderButtons("preview")}
        </form>
      );
    }

    const successMessageArray: string[] = [
      "Payments will begin automatically",
      hasWallet(draftDetails?.registrationContactType)
        ? ""
        : " to receivers who have registered their wallet",
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
              buttons={[
                {
                  label: "View",
                  onClick: handleViewDetails,
                },
                {
                  label: "Dismiss",
                  onClick: () => {
                    setIsResponseSuccess(false);
                  },
                },
              ]}
            >
              {successMessageArray.join("")}
            </NotificationWithButtons>
          ) : null}

          <form className="DisbursementForm">
            <DisbursementDetails
              variant="confirmation"
              details={draftDetails}
              futureBalance={futureBalance}
              csvFile={csvFile}
            />
            <DisbursementInviteMessage isEditMessage={false} draftMessage={customMessage} />

            {renderButtons("confirmation")}
          </form>
        </>
      );
    }

    // Edit
    return (
      <>
        <form onSubmit={handleReview} className="DisbursementForm">
          <Card>
            <InfoTooltip infoText="The total amount of funds you have available for disbursements">
              <Title size="md">Current balance</Title>
            </InfoTooltip>
            <div className="DisbursementForm__balances">
              <AccountBalances accountBalances={allBalances} />
            </div>
          </Card>

          <DisbursementDetails
            variant="edit"
            details={draftDetails}
            futureBalance={futureBalance}
            onChange={(updatedState) => {
              if (apiError) {
                dispatch(clearDisbursementDraftsErrorAction());
              }

              setDraftDetails(updatedState);
            }}
            onValidate={(isValid) => {
              setIsDetailsValid(isValid);
            }}
          />

          <DisbursementInviteMessage
            isEditMessage={true}
            onChange={(updatedDisbursementInviteMessage) => {
              setCustomMessage(updatedDisbursementInviteMessage);
            }}
            disabledReasonForTooltip={
              hasWallet(draftDetails?.registrationContactType)
                ? "No invitation message will be sent because you're registering receivers with wallets addresses."
                : undefined
            }
          />
          <DisbursementInstructions
            variant="upload"
            csvFile={csvFile}
            onChange={handleCsvFileChange}
            isDisabled={!isDraftEnabled}
            registrationContactType={draftDetails?.registrationContactType}
            verificationField={draftDetails?.verificationField}
          />

          {renderButtons("edit")}
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
            label: "New disbursement",
          },
        ]}
      />

      <SectionHeader>
        <SectionHeader.Row>
          <SectionHeader.Content>
            <Heading as="h2" size="sm">
              New disbursement
            </Heading>
          </SectionHeader.Content>

          <SectionHeader.Content align="right">
            <Toast isVisible={isDraftInProgress} setIsVisible={setIsDraftInProgress}>
              <Badge variant="tertiary">Changes saved</Badge>
            </Toast>
          </SectionHeader.Content>
        </SectionHeader.Row>
      </SectionHeader>

      {isSavedDraftMessageVisible ? (
        <NotificationWithButtons
          ref={notificationRef}
          variant="success"
          title="Draft saved"
          buttons={[
            {
              label: "View drafts",
              onClick: () => {
                navigate(Routes.DISBURSEMENT_DRAFTS);
              },
            },
            {
              label: "Dismiss",
              onClick: () => setIsSavedDraftMessageVisible(false),
            },
          ]}
        >
          Your disbursement has been saved.
        </NotificationWithButtons>
      ) : null}

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

      {renderCurrentStep()}
    </>
  );
};
