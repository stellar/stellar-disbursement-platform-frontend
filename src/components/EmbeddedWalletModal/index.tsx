import { Button, Icon, NavButton } from "@stellar/design-system";
import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

import "./styles.scss";

interface EmbeddedWalletModalProps {
  visible: boolean;
  onClose?: () => void;
  isDismissible?: boolean;
  title: string;
  description: string;
  contentAlign?: "center" | "left";
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  isPrimaryActionLoading?: boolean;
  isPrimaryActionDisabled?: boolean;
}

const MODAL_OPEN_CLASS_NAME = "modal-open";
const MODAL_PARENT_ID = "embedded-wallet-modal-root";

export const EmbeddedWalletModal = ({
  visible,
  onClose,
  isDismissible = true,
  title,
  description,
  contentAlign = "center",
  primaryActionLabel,
  onPrimaryAction,
  isPrimaryActionLoading = false,
  isPrimaryActionDisabled = false,
}: EmbeddedWalletModalProps) => {
  const isModalDismissible = Boolean(onClose) && isDismissible;

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const closeOnEscape = useCallback(
    (event: KeyboardEvent) => {
      if (!isModalDismissible) {
        return;
      }
      if (event.key === "Escape") {
        handleClose();
      }
    },
    [handleClose, isModalDismissible],
  );

  useEffect(() => {
    if (!visible || !isModalDismissible) {
      return undefined;
    }

    document.addEventListener("keyup", closeOnEscape);
    return () => {
      document.removeEventListener("keyup", closeOnEscape);
    };
  }, [closeOnEscape, isModalDismissible, visible]);

  useEffect(() => {
    if (visible) {
      document.body.classList.add(MODAL_OPEN_CLASS_NAME);
      return () => {
        document.body.classList.remove(MODAL_OPEN_CLASS_NAME);
      };
    }

    document.body.classList.remove(MODAL_OPEN_CLASS_NAME);
    return undefined;
  }, [visible]);

  const shouldShowFooter = Boolean(primaryActionLabel && onPrimaryAction);

  const parent = document.getElementById(MODAL_PARENT_ID);
  if (!parent || !visible) {
    return null;
  }

  return createPortal(
    <div className="EmbeddedWalletModal">
      <div className="EmbeddedWalletModal__container">
        <div className="EmbeddedWalletModal__content">
          {isModalDismissible ? (
            <div className="EmbeddedWalletModal__close">
              <NavButton
                id="embedded-wallet-modal-close-button"
                title="Close modal"
                onClick={handleClose}
                icon={<Icon.XClose />}
              />
            </div>
          ) : null}

          <div className="EmbeddedWalletModal__heading" data-align={contentAlign}>
            <span className="EmbeddedWalletModal__title">{title}</span>
          </div>

          <div className="EmbeddedWalletModal__body" data-align={contentAlign}>
            <p className="EmbeddedWalletModal__description">{description}</p>
          </div>

          {shouldShowFooter ? (
            <div className="EmbeddedWalletModal__footer">
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
            </div>
          ) : null}
        </div>
      </div>

      <div
        className="EmbeddedWalletModal__background"
        {...(isModalDismissible ? { onClick: handleClose } : {})}
      />
    </div>,
    parent,
  );
};
