import { ReactNode, useCallback, useEffect } from "react";

import { createPortal } from "react-dom";

import { Button, Heading, Icon, NavButton } from "@stellar/design-system";

import "./styles.scss";

interface EmbeddedWalletModalProps {
  visible: boolean;
  onClose?: () => void;
  isDismissible?: boolean;
  modalAlign?: "center" | "bottom";
  title: ReactNode;
  titleAlign?: "center" | "left";
  content: ReactNode;
  contentAlign?: "center" | "left";
  containerClassName?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  isPrimaryActionLoading?: boolean;
  isPrimaryActionDisabled?: boolean;
}

export const MODAL_PARENT_ID = "embedded-wallet-modal-root";

export const EmbeddedWalletModal = ({
  visible,
  onClose,
  isDismissible = true,
  modalAlign = "center",
  title,
  titleAlign,
  content,
  contentAlign = "center",
  containerClassName,
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
      return;
    }

    document.addEventListener("keyup", closeOnEscape);
    return () => {
      document.removeEventListener("keyup", closeOnEscape);
    };
  }, [closeOnEscape, isModalDismissible, visible]);

  const shouldShowFooter = Boolean(primaryActionLabel && onPrimaryAction);

  const parent = document.getElementById(MODAL_PARENT_ID);
  if (!parent || !visible) {
    return null;
  }

  return createPortal(
    <div className="EmbeddedWalletModal">
      <div
        className={`EmbeddedWalletModal__container${containerClassName ? ` ${containerClassName}` : ""}`}
        data-align={modalAlign}
      >
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

          <Heading
            className="EmbeddedWalletModal__heading"
            data-align={titleAlign ?? contentAlign}
            children={title}
            as={"h2"}
            size={"sm"}
          />

          <div className="EmbeddedWalletModal__body" data-align={contentAlign}>
            {content}
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
