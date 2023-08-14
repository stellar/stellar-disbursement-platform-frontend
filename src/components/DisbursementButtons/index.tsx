import { Button, Icon } from "@stellar/design-system";
import { useNavigate } from "react-router-dom";
import { Routes } from "constants/settings";
import { DisbursementDraftAction, DisbursementStep } from "types";
import "./styles.scss";

interface DisbursementButtonsPros {
  variant: DisbursementStep;
  onSaveDraft: () => void;
  onDiscard?: () => void;
  onGoBack: () => void;
  onNewDisbursement?: () => void;
  onGoToDrafts?: () => void;
  clearDrafts?: () => void;
  isReviewDisabled?: boolean;
  isDraftDisabled?: boolean;
  isSubmitDisabled?: boolean;
  isDraftPending?: boolean;
  actionType?: DisbursementDraftAction;
}

export const DisbursementButtons = ({
  variant,
  onSaveDraft,
  onDiscard,
  onGoBack,
  onNewDisbursement,
  onGoToDrafts,
  clearDrafts,
  isReviewDisabled,
  isDraftDisabled,
  isSubmitDisabled,
  isDraftPending,
  actionType,
}: DisbursementButtonsPros) => {
  const navigate = useNavigate();

  const isSavePending = isDraftPending && actionType === "save";
  const isSubmitPending = isDraftPending && actionType === "submit";

  const handleGoToDisbursements = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();

    if (clearDrafts) {
      clearDrafts();
    }

    navigate(Routes.DISBURSEMENTS);
  };

  const handleGoToDrafts = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();

    if (onGoToDrafts) {
      onGoToDrafts();
    } else {
      if (clearDrafts) {
        clearDrafts();
      }

      navigate(Routes.DISBURSEMENT_DRAFTS);
    }
  };

  const handleStartNewDisbursement = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();

    if (onNewDisbursement) {
      onNewDisbursement();
    } else {
      if (clearDrafts) {
        clearDrafts();
      }

      navigate(Routes.DISBURSEMENT_NEW);
    }
  };

  const handleDiscard = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();
    if (onDiscard) {
      onDiscard();
    }
  };

  const handleSaveDraft = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();
    onSaveDraft();
  };

  const handleGoBack = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();
    onGoBack();
  };

  const renderContent = () => {
    if (variant === "edit") {
      return (
        <>
          <Button
            variant="error"
            size="xs"
            icon={<Icon.DeleteForever />}
            iconPosition="right"
            onClick={handleDiscard}
            disabled={isSavePending}
          >
            Discard
          </Button>

          <div className="DisbursementButtons--continue">
            <Button
              variant="secondary"
              size="xs"
              onClick={handleSaveDraft}
              disabled={isDraftDisabled}
              {...(isDraftDisabled
                ? {
                    title:
                      "Please complete all fields above before saving a draft",
                  }
                : {})}
              isLoading={isSavePending}
            >
              Save as a draft
            </Button>
            <Button
              variant="secondary"
              size="xs"
              icon={<Icon.ArrowRight />}
              iconPosition="right"
              type="submit"
              disabled={isReviewDisabled || isSavePending}
            >
              Review
            </Button>
          </div>
        </>
      );
    }

    if (variant === "preview") {
      return (
        <>
          <Button
            variant="secondary"
            size="xs"
            icon={<Icon.ArrowLeft />}
            iconPosition="left"
            onClick={handleGoBack}
            disabled={isSavePending || isSubmitPending}
          >
            Back
          </Button>

          <div className="DisbursementButtons--continue">
            <Button
              variant="secondary"
              size="xs"
              onClick={handleSaveDraft}
              isLoading={isSavePending}
              disabled={isDraftDisabled || isSubmitPending}
            >
              Save as a draft
            </Button>
            <Button
              variant="primary"
              size="xs"
              icon={<Icon.CheckCircle />}
              iconPosition="right"
              type="submit"
              disabled={isSubmitDisabled || isSavePending}
              isLoading={isSubmitPending}
            >
              Confirm disbursement
            </Button>
          </div>
        </>
      );
    }

    // "confirmation" variant
    return (
      <>
        <Button
          variant="secondary"
          size="xs"
          icon={<Icon.ArrowLeft />}
          iconPosition="left"
          onClick={handleGoToDisbursements}
        >
          Back to disbursements
        </Button>

        <div className="DisbursementButtons--continue">
          <Button variant="secondary" size="xs" onClick={handleGoToDrafts}>
            Go to drafts
          </Button>
          <Button
            variant="primary"
            size="xs"
            icon={<Icon.Add />}
            iconPosition="right"
            onClick={handleStartNewDisbursement}
          >
            Create a new disbursement
          </Button>
        </div>
      </>
    );
  };

  return <div className="DisbursementButtons">{renderContent()}</div>;
};
