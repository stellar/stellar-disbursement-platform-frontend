import { Button, Modal } from "@stellar/design-system";

import "./styles.scss";

interface EmbeddedWalletModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  contentAlign?: "center" | "left";
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  isPrimaryActionLoading?: boolean;
  isPrimaryActionDisabled?: boolean;
}

export const EmbeddedWalletModal = ({
  visible,
  onClose,
  title,
  description,
  contentAlign = "center",
  primaryActionLabel,
  onPrimaryAction,
  isPrimaryActionLoading = false,
  isPrimaryActionDisabled = false,
}: EmbeddedWalletModalProps) => {
  const handleClose = () => {
    onClose();
  };

  const contentAlignClass = `EmbeddedWalletModal__content--${contentAlign}`;
  const headingAlignClass = `EmbeddedWalletModal__heading--${contentAlign}`;

  return (
    <Modal parentId="embedded-wallet-modal-root" visible={visible} onClose={handleClose}>
      <Modal.Heading>
        <div className={`EmbeddedWalletModal__heading ${headingAlignClass}`}>
          <span className="EmbeddedWalletModal__title">{title}</span>
        </div>
      </Modal.Heading>
      <Modal.Body>
        <div className={`EmbeddedWalletModal__content ${contentAlignClass}`}>
          {description ? <p className="EmbeddedWalletModal__description">{description}</p> : null}
        </div>
      </Modal.Body>
      {primaryActionLabel && onPrimaryAction ? (
        <Modal.Footer itemAlignment="stretch">
          <Button
            variant="primary"
            size="lg"
            isFullWidth
            onClick={onPrimaryAction}
            isLoading={isPrimaryActionLoading}
            disabled={isPrimaryActionDisabled}
          >
            {primaryActionLabel}
          </Button>
        </Modal.Footer>
      ) : null}
    </Modal>
  );
};
