import { useEffect, useRef, useState } from "react";

import { BigNumber } from "bignumber.js";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Badge, Button, Card, Heading, Notification } from "@stellar/design-system";

import { AccountBalances } from "@/components/AccountBalances";
import { AssetAmount } from "@/components/AssetAmount";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DisbursementButtons } from "@/components/DisbursementButtons";
import { DisbursementDetails } from "@/components/DisbursementDetails";
import { DisbursementInstructions } from "@/components/DisbursementInstructions";
import { DisbursementInviteMessage } from "@/components/DisbursementInviteMessage";
import { ErrorWithExtras } from "@/components/ErrorWithExtras";
import { InfoTooltip } from "@/components/InfoTooltip";
import { NotificationWithButtons } from "@/components/NotificationWithButtons";
import { SectionHeader } from "@/components/SectionHeader";
import { SourceAccount } from "@/components/SourceAccount";
import { Title } from "@/components/Title";
import { Toast } from "@/components/Toast";

import {
  clearDisbursementDraftsErrorAction,
  resetDisbursementDraftsAction,
  saveDisbursementDraftAction,
  submitDisbursementNewDraftAction,
} from "@/store/ducks/disbursementDrafts";

import { Routes } from "@/constants/settings";

import { useDistributionWalletBalance } from "@/apiQueries/useDistributionWalletBalance";
import { useDistributionWallets } from "@/apiQueries/useDistributionWallets";

import { accountColor } from "@/helpers/accountColor";
import { csvTotalAmount } from "@/helpers/csvTotalAmount";
import { parseAssetKey } from "@/helpers/parseAssetKey";

import { useAllBalances } from "@/hooks/useAllBalances";
import { useRedux } from "@/hooks/useRedux";
import { useSelectedWallet } from "@/hooks/useSelectedWallet";

import { AccountBalanceItem, Disbursement, DisbursementStep, hasWallet } from "@/types";

import { AppDispatch } from "@/store";

export const DisbursementsNew = () => {
  const { disbursementDrafts, organization, userAccount } = useRedux(
    "disbursementDrafts",
    "organization",
    "userAccount",
  );

  const [draftDetails, setDraftDetails] = useState<Disbursement>();
  const [customMessage, setCustomMessage] = useState("");
  const [isDetailsValid, setIsDetailsValid] = useState(false);
  const [csvFile, setCsvFile] = useState<File | undefined>();
  const [csvTotal, setCsvTotal] = useState<string | null>(null);
  const [csvRowCount, setCsvRowCount] = useState<number | null>(null);
  const [csvParseError, setCsvParseError] = useState<string | undefined>();
  const [futureBalance, setFutureBalance] = useState(0);

  const [currentStep, setCurrentStep] = useState<DisbursementStep>("edit");
  const [isDraftInProgress, setIsDraftInProgress] = useState(false);
  const [isSavedDraftMessageVisible, setIsSavedDraftMessageVisible] = useState(false);
  const [isResponseSuccess, setIsResponseSuccess] = useState<boolean>(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  // Multi-account routing: a disbursement is funded by exactly one distribution account,
  // so on multi-account tenants the wizard requires a concrete selection up front (the
  // backend rejects creates without one) and every balance shown/validated is that
  // account's — not the tenant default's.
  const { selectedWalletId, setSelectedWalletId } = useSelectedWallet();
  const { data: distributionWallets } = useDistributionWallets(userAccount.isAuthenticated);
  const isMultiWallet = (distributionWallets?.length ?? 0) >= 2;
  const selectedWallet = distributionWallets?.find((w) => w.id === selectedWalletId);
  const { data: selectedWalletBalance } = useDistributionWalletBalance(
    userAccount.isAuthenticated && isMultiWallet && Boolean(selectedWalletId),
    selectedWalletId || null,
  );

  const isDraftEnabled = isDetailsValid;
  const isReviewEnabled = isDraftEnabled && Boolean(csvFile) && !csvParseError;
  const isKWA = hasWallet(draftDetails?.registrationContactType);

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const apiError = disbursementDrafts.status === "ERROR" && disbursementDrafts.errorString;

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  // The balances the wizard shows AND validates against. On a multi-account tenant these are
  // the SELECTED account's live balances; the tenant-default fallback is only correct for
  // single-account tenants.
  const getEffectiveBalances = (): AccountBalanceItem[] | undefined => {
    if (isMultiWallet && selectedWalletId) {
      if (!selectedWalletBalance) return undefined;
      return Object.entries(selectedWalletBalance.balances).map(([assetKey, amount]) => {
        const { code, issuer } = parseAssetKey(assetKey);

        return {
          balance: amount || "0",
          assetCode: code,
          assetIssuer: issuer,
        };
      });
    }
    return allBalances;
  };
  const effectiveBalances = getEffectiveBalances();

  // Recompute the projected post-disbursement balance whenever the CSV total, the chosen
  // asset, or the account's live balance changes (previously it was only computed at upload
  // time, so switching the asset afterwards validated against a stale number).
  useEffect(() => {
    if (!csvTotal) {
      setFutureBalance(0);
      return;
    }
    const assetBalance =
      getEffectiveBalances()?.find((a) => a.assetCode === draftDetails?.asset?.code)?.balance ??
      "0";
    setFutureBalance(Number(assetBalance) - Number(csvTotal));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    csvTotal,
    draftDetails?.asset?.code,
    selectedWalletBalance,
    allBalances,
    isMultiWallet,
    selectedWalletId,
  ]);

  const resetState = () => {
    setCurrentStep("edit");
    setDraftDetails(undefined);
    setIsDetailsValid(false);
    setCsvFile(undefined);
    setCsvTotal(null);
    setCsvRowCount(null);
    setCsvParseError(undefined);
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
          // The account chosen in this wizard funds the disbursement (see `renderSendingFrom`).
          sourceWalletId: selectedWalletId || undefined,
        }),
      );
    }
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
          // The account chosen in this wizard funds the disbursement (see `renderSendingFrom`).
          sourceWalletId: selectedWalletId || undefined,
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
    setCsvParseError(undefined);
    calculateDisbursementTotalAmountFromFile(file);
    setCsvFile(file);
  };

  const calculateDisbursementTotalAmountFromFile = (csvFile?: File) => {
    csvTotalAmount({ csvFile })
      .then((summary) => {
        if (!summary) {
          setCsvTotal(null);
          setCsvRowCount(null);
          return;
        }

        setCsvTotal(summary.totalAmount.toString());
        setCsvRowCount(summary.rowCount);
        setDraftDetails({
          ...draftDetails,
          stats: {
            ...draftDetails?.stats,
            totalAmount: summary.totalAmount.toString(),
          },
        } as Disbursement);
      })
      // A file that fails to parse must be a visible error, not a silently-enabled Review.
      .catch((e: Error) => {
        setCsvTotal(null);
        setCsvRowCount(null);
        setCsvParseError(e.message);
      });
  };

  const handleViewDetails = () => {
    navigate(`${Routes.DISBURSEMENTS}/${disbursementDrafts.newDraftId}`);
    resetState();
  };

  // Why "Confirm disbursement" is disabled, stated on-screen — a native title tooltip is
  // invisible on touch/keyboard, and a silently dead button is where testers got stuck.
  const getSubmitDisabledReason = (): string | undefined => {
    if (organization.data.isApprovalRequired) {
      return "Your organization requires disbursements to be approved by another user. Save as a draft and make sure another user reviews and submits.";
    }
    if (csvParseError) {
      return `The uploaded file could not be read: ${csvParseError}`;
    }
    if (draftDetails && csvFile && BigNumber(futureBalance).lt(0)) {
      const assetCode = draftDetails?.asset?.code ?? "";
      const accountName = isMultiWallet && selectedWallet ? ` of ${selectedWallet.name}` : "";
      return `This disbursement's total exceeds the available ${assetCode} balance${accountName}. Lower the amounts in the file or fund the account, then re-upload.`;
    }
    return undefined;
  };
  const submitDisabledReason = getSubmitDisabledReason();

  // Persistent "which account funds this?" context — shown on every step of the wizard.
  const renderSendingFrom = () => {
    if (!isMultiWallet || !selectedWallet) return null;
    return (
      <div className="Note" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        Sending from
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            width: "0.5rem",
            height: "0.5rem",
            borderRadius: "999px",
            backgroundColor: accountColor(selectedWallet.id),
          }}
        />
        <strong>{selectedWallet.name}</strong>
        {selectedWallet.distribution_account_address ? (
          <span>
            ({selectedWallet.distribution_account_address.slice(0, 4)}…
            {selectedWallet.distribution_account_address.slice(-4)})
          </span>
        ) : null}
      </div>
    );
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
          Boolean(csvParseError) ||
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
    // Multi-account tenants must pick the funding account before anything else — the create
    // is rejected without one, so don't let the user fill a whole form that can't submit.
    if (isMultiWallet && !selectedWalletId) {
      return (
        <div className="DisbursementForm">
          <Card>
            <Title size="md">Choose the account to send from</Title>
            <div className="Note" style={{ margin: "0.5rem 0 1rem" }}>
              Every disbursement is funded by a single distribution account. Pick one to continue —
              you can also use the account switcher at the top of the page.
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {distributionWallets?.map((wallet) => (
                <Button
                  key={wallet.id}
                  size="md"
                  variant="tertiary"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedWalletId(wallet.id);
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      display: "inline-block",
                      width: "0.5rem",
                      height: "0.5rem",
                      borderRadius: "999px",
                      marginRight: "0.5rem",
                      backgroundColor: accountColor(wallet.id),
                    }}
                  />
                  {wallet.name}
                  {wallet.is_default ? " (default)" : ""}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      );
    }

    // Preview
    if (currentStep === "preview") {
      return (
        <form onSubmit={handleSubmitDisbursement} className="DisbursementForm">
          {renderSendingFrom()}
          <DisbursementDetails
            variant="preview"
            details={draftDetails}
            futureBalance={futureBalance}
          />
          {!isKWA && (
            <DisbursementInviteMessage isEditMessage={false} draftMessage={customMessage} />
          )}
          <DisbursementInstructions
            variant="preview"
            csvFile={csvFile}
            onChange={handleCsvFileChange}
            registrationContactType={draftDetails?.registrationContactType}
            verificationField={draftDetails?.verificationField}
          />

          {submitDisabledReason ? (
            <Notification variant="warning" title="Can't confirm yet" isFilled>
              {submitDisabledReason}
            </Notification>
          ) : null}

          {renderButtons("preview")}
        </form>
      );
    }

    const successMessageArray: string[] = [
      "Payments will begin automatically",
      isKWA ? "" : " to receivers who have registered their wallet",
      ". Click 'View' to track your disbursement in real-time.",
    ].filter((m) => Boolean(m));

    // Confirmation
    if (currentStep === "confirmation") {
      // A created disbursement gets a RECEIPT, not a success banner floating over the (now
      // stale) form — dismissing that banner used to leave the filled form looking editable.
      if (isResponseSuccess) {
        return (
          <div ref={notificationRef}>
            <Notification variant="success" title="Disbursement created" isFilled>
              {successMessageArray.join("")}
            </Notification>

            <Card>
              <Title size="md">Receipt</Title>
              <div style={{ marginTop: "0.75rem" }}>
                {[
                  { label: "Disbursement name", value: draftDetails?.name ?? "-" },
                  {
                    label: "Total amount",
                    value: (
                      <AssetAmount
                        amount={csvTotal ?? draftDetails?.stats?.totalAmount ?? "0"}
                        assetCode={draftDetails?.asset?.code}
                        fallback="-"
                      />
                    ),
                  },
                  {
                    label: "Payments",
                    value: csvRowCount != null ? String(csvRowCount) : "-",
                  },
                  {
                    label: "Sending from",
                    value: <SourceAccount sourceWalletId={selectedWalletId || undefined} />,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "0.5rem 0",
                      borderBottom: "1px solid var(--sds-clr-gray-06)",
                    }}
                  >
                    <span className="Note">{row.label}</span>
                    <span style={{ fontWeight: 500 }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <Button size="md" variant="primary" onClick={handleViewDetails}>
                  View disbursement
                </Button>
                <Button size="md" variant="secondary" onClick={handleStartNewDisbursement}>
                  Create another
                </Button>
              </div>
            </Card>
          </div>
        );
      }

      return (
        <form className="DisbursementForm">
          {renderSendingFrom()}
          <DisbursementDetails
            variant="confirmation"
            details={draftDetails}
            futureBalance={futureBalance}
            csvFile={csvFile}
          />
          {!isKWA && (
            <DisbursementInviteMessage isEditMessage={false} draftMessage={customMessage} />
          )}

          {renderButtons("confirmation")}
        </form>
      );
    }

    // Edit
    return (
      <>
        <form onSubmit={handleReview} className="DisbursementForm">
          <Card>
            <InfoTooltip
              infoText={
                isMultiWallet && selectedWallet
                  ? `The live balance of ${selectedWallet.name} — the account this disbursement will be paid from`
                  : "The total amount of funds you have available for disbursements"
              }
            >
              <Title size="md">
                {isMultiWallet && selectedWallet
                  ? `Available balance — ${selectedWallet.name}`
                  : "Current balance"}
              </Title>
            </InfoTooltip>
            <div className="DisbursementForm__balances">
              <AccountBalances accountBalances={effectiveBalances} />
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

          {!isKWA && (
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
          )}
          <DisbursementInstructions
            variant="upload"
            csvFile={csvFile}
            onChange={handleCsvFileChange}
            isDisabled={!isDraftEnabled}
            registrationContactType={draftDetails?.registrationContactType}
            verificationField={draftDetails?.verificationField}
          />

          {csvParseError ? (
            <Notification variant="error" title="This file can't be used" isFilled>
              {csvParseError} — fix the file and upload it again.
            </Notification>
          ) : null}

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
