import { Button, Icon } from "@stellar/design-system";

import { Box } from "@/components/Box";
import { EmbeddedWalletModal } from "@/components/EmbeddedWalletModal";

import { STELLAR_EXPERT_URL } from "@/constants/envVariables";

import { getTransferDisplay } from "@/helpers/transferDisplay";

import "./styles.scss";

type Status = "success" | "failed";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  status: Status;
  amount: string;
  assetCode: string;
  destination: string;
  transactionHash?: string;
};

const statusCopy: Record<
  Status,
  { title: string; message: (displayAmount: string, destinationDisplay: string) => string }
> = {
  success: {
    title: "Transaction completed",
    message: (displayAmount, destinationDisplay) =>
      `Your ${displayAmount} has been successfully sent to ${destinationDisplay}`,
  },
  failed: {
    title: "Transaction failed",
    message: (displayAmount, destinationDisplay) =>
      `Your ${displayAmount} transfer to ${destinationDisplay} failed.`,
  },
};

export const EmbeddedWalletTransferStatusModal = ({
  isOpen,
  onClose,
  status,
  amount,
  assetCode,
  destination,
  transactionHash,
}: Props) => {
  const { displayAmount, destinationDisplay } = getTransferDisplay(amount, assetCode, destination);
  const isViewDisabled = !transactionHash;

  const handleViewOnExplorer = () => {
    if (!transactionHash) {
      return;
    }

    const url = `${STELLAR_EXPERT_URL}/tx/${transactionHash}`;
    window.open(url, "_blank", "noopener");
  };

  const copy = statusCopy[status];

  return (
    <EmbeddedWalletModal
      visible={isOpen}
      onClose={onClose}
      title={copy.title}
      modalAlign="center"
      titleAlign="center"
      contentAlign="center"
      content={
        <Box
          gap="xl"
          addlClassName={`EmbeddedWalletTransferStatusModal EmbeddedWalletTransferStatusModal--${status}`}
        >
          <div className="EmbeddedWalletTransferStatusModal__summary">
            <div className="EmbeddedWalletTransferStatusModal__statusIcon">
              {status === "success" ? <Icon.Check /> : <Icon.AlertCircle />}
            </div>
            <div className="EmbeddedWalletTransferStatusModal__message">
              {copy.message(displayAmount, destinationDisplay)}
            </div>
          </div>

          <div className="EmbeddedWalletTransferStatusModal__actions">
            <Button variant="primary" size="lg" isFullWidth onClick={onClose}>
              Close
            </Button>
            <Button
              variant="tertiary"
              size="lg"
              isFullWidth
              icon={<Icon.LinkExternal01 />}
              iconPosition="right"
              onClick={handleViewOnExplorer}
              disabled={isViewDisabled}
            >
              View on Stellar.expert
            </Button>
          </div>
        </Box>
      }
    />
  );
};
