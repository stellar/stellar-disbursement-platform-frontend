import { Button, Icon, Input, Text } from "@stellar/design-system";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import { Box } from "@/components/Box";
import { EmbeddedWalletModal } from "@/components/EmbeddedWalletModal";
import { amount as amountFormatter } from "@/helpers/formatIntlNumber";
import { isClassicWalletAddress, isValidWalletAddress } from "@/helpers/walletValidate";
import "./styles.scss";

// Normalize user input while preserving a single decimal separator.
const sanitizeAmountInput = (value: string) => {
  const normalized = value.replace(/,/g, "");

  if (!normalized) {
    return "";
  }

  if (!/^\d*\.?\d*$/.test(normalized)) {
    return null;
  }

  const [integerPart, decimalPart] = normalized.split(".");
  const trimmedInteger = integerPart.replace(/^0+(?=\d)/, "") || "0";

  return decimalPart === undefined ? trimmedInteger : `${trimmedInteger}.${decimalPart}`;
};

// Track caret positions across formatting updates in a contentEditable span.
const getCaretIndex = (element: HTMLElement) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  if (!element.contains(range.endContainer)) {
    return null;
  }

  const preRange = range.cloneRange();
  preRange.selectNodeContents(element);
  preRange.setEnd(range.endContainer, range.endOffset);
  return preRange.toString().length;
};

const setCaretIndex = (element: HTMLElement, index: number) => {
  const selection = window.getSelection();
  if (!selection) {
    return;
  }

  const range = document.createRange();
  const textNode = element.firstChild;
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
    range.selectNodeContents(element);
    range.collapse(false);
  } else {
    const length = textNode.textContent?.length ?? 0;
    range.setStart(textNode, Math.min(index, length));
    range.collapse(true);
  }

  selection.removeAllRanges();
  selection.addRange(range);
};

const getNumericCaretIndex = (value: string, caretIndex: number | null) => {
  if (caretIndex === null) {
    return null;
  }

  const digits = value.slice(0, caretIndex).match(/[0-9.]/g);
  return digits ? digits.length : 0;
};

const getCaretIndexForNumericCount = (value: string, numericCount: number) => {
  if (numericCount <= 0) {
    return 0;
  }

  let seen = 0;
  for (let i = 0; i < value.length; i += 1) {
    if (/[0-9.]/.test(value[i])) {
      seen += 1;
      if (seen >= numericCount) {
        return i + 1;
      }
    }
  }
  return value.length;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  destination: string;
  onAmountChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  availableBalance: string;
  assetCode: string;
  isSubmitDisabled: boolean;
  isSubmitLoading: boolean;
  isWalletReady: boolean;
  onSubmit: () => void;
};

export const EmbeddedWalletTransferModal = ({
  isOpen,
  onClose,
  amount,
  destination,
  onAmountChange,
  onDestinationChange,
  availableBalance,
  assetCode,
  isSubmitDisabled,
  isSubmitLoading,
  isWalletReady,
  onSubmit,
}: Props) => {
  const displayAmount = amount ? amountFormatter.format(Number(amount)) : "";
  const canPaste =
    typeof navigator !== "undefined" && typeof navigator.clipboard?.readText === "function";
  const numericAmount = Number.parseFloat(amount);
  const numericAvailableBalance = Number.parseFloat(availableBalance);
  const formattedAvailableBalance = Number.isFinite(numericAvailableBalance)
    ? amountFormatter.format(numericAvailableBalance)
    : availableBalance;
  const isAddressValid = isValidWalletAddress(destination);
  const shouldShowExchangeWarning = isClassicWalletAddress(destination);
  const isAmountInvalid = !Number.isFinite(numericAmount) || numericAmount <= 0;
  const isAmountOverBalance =
    Number.isFinite(numericAmount) &&
    Number.isFinite(numericAvailableBalance) &&
    numericAmount > numericAvailableBalance;
  const isReviewDisabled =
    isSubmitDisabled || !isAddressValid || isAmountInvalid || isAmountOverBalance;
  const isInputDisabled = !isWalletReady || isSubmitLoading;
  const isAmountEditable = !isInputDisabled;
  const isPasteDisabled = !canPaste || isInputDisabled;
  const isMaxDisabled = isInputDisabled || !Number(availableBalance);
  const amountInputRef = useRef<HTMLSpanElement | null>(null);
  const pendingCaretRef = useRef<number | null>(null);

  const handlePaste = useCallback(async () => {
    if (isPasteDisabled) {
      return;
    }

    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onDestinationChange(text.trim());
      }
    } catch {
      // Ignore clipboard errors and leave the field unchanged.
    }
  }, [isPasteDisabled, onDestinationChange]);

  const handleSelectAll = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a") {
      event.preventDefault();
      event.stopPropagation();
      const target = event.currentTarget;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        target.select();
        return;
      }

      const selection = window.getSelection();
      if (!selection) {
        return;
      }

      const range = document.createRange();
      range.selectNodeContents(target);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, []);

  // Keep the rendered content in sync and restore caret after formatting.
  useLayoutEffect(() => {
    const input = amountInputRef.current;
    if (input && input.textContent !== displayAmount) {
      const isFocused = document.activeElement === input;
      input.textContent = displayAmount;
      if (isFocused && pendingCaretRef.current !== null) {
        const nextCaretIndex = getCaretIndexForNumericCount(displayAmount, pendingCaretRef.current);
        setCaretIndex(input, nextCaretIndex);
      }
    }
    pendingCaretRef.current = null;
  }, [displayAmount]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const rafId = requestAnimationFrame(() => {
      if (isWalletReady && !isSubmitLoading) {
        amountInputRef.current?.focus();
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [isOpen, isSubmitLoading, isWalletReady]);

  return (
    <EmbeddedWalletModal
      visible={isOpen}
      onClose={onClose}
      title="Transfer to wallet"
      modalAlign="bottom"
      titleAlign="center"
      content={
        <Box gap="xl">
          <Box gap="xs">
            <div className="EmbeddedWalletTransferModal__amountField">
              <div className="EmbeddedWalletTransferModal__amountHeader">
                <div className="EmbeddedWalletTransferModal__amountRow">
                  <span
                    id="wallet-transfer-amount"
                    className="EmbeddedWalletTransferModal__amountInput"
                    data-asset-code={assetCode}
                    inputMode="decimal"
                    role="textbox"
                    tabIndex={isAmountEditable ? 0 : -1}
                    spellCheck={false}
                    contentEditable={isAmountEditable}
                    suppressContentEditableWarning
                    onInput={(event) => {
                      const rawValue = event.currentTarget.textContent ?? "";
                      const caretIndex = getCaretIndex(event.currentTarget);
                      pendingCaretRef.current = getNumericCaretIndex(rawValue, caretIndex);
                      const nextValue = sanitizeAmountInput(rawValue);
                      if (nextValue === null) {
                        pendingCaretRef.current = getNumericCaretIndex(
                          displayAmount,
                          displayAmount.length,
                        );
                        event.currentTarget.textContent = displayAmount;
                        setCaretIndex(event.currentTarget, displayAmount.length);
                        return;
                      }
                      if (nextValue === amount) {
                        pendingCaretRef.current = null;
                        return;
                      }
                      onAmountChange(nextValue);
                    }}
                    onKeyDown={(event) => {
                      handleSelectAll(event);
                      if (event.key === "Enter") {
                        event.preventDefault();
                      }
                    }}
                    ref={amountInputRef}
                  />
                </div>
                <button
                  type="button"
                  className="EmbeddedWalletTransferModal__maxButton"
                  onClick={() => {
                    const formattedBalance = amountFormatter.format(Number(availableBalance));
                    pendingCaretRef.current = getNumericCaretIndex(
                      formattedBalance,
                      formattedBalance.length,
                    );
                    onAmountChange(availableBalance);
                  }}
                  disabled={isMaxDisabled}
                >
                  Max
                </button>
              </div>
            </div>
            <Text size="sm" as="p">
              {formattedAvailableBalance} {assetCode} available
            </Text>
          </Box>

          <div className="EmbeddedWalletTransferModal__destinationInput">
            <Input
              id="wallet-transfer-destination"
              label="Send to"
              fieldSize="md"
              value={destination}
              onChange={(event) => onDestinationChange(event.currentTarget.value)}
              placeholder="Enter address to send to"
              required
              disabled={isInputDisabled}
              onKeyDown={handleSelectAll}
              rightElement={
                <button
                  type="button"
                  className="EmbeddedWalletTransferModal__pasteButton"
                  onClick={handlePaste}
                  disabled={isPasteDisabled}
                >
                  Paste
                </button>
              }
            />
          </div>
          {shouldShowExchangeWarning ? (
            <div className="EmbeddedWalletTransferModal__exchangeWarning" role="alert">
              <div className="EmbeddedWalletTransferModal__exchangeWarningHeader">
                <Icon.AlertCircle />
                <span>Exchanges aren't supported yet</span>
              </div>
              <div className="EmbeddedWalletTransferModal__exchangeWarningBody">
                <div>You can send funds only to Stellar wallets.</div>
                <div>Sending to an exchange may result in lost funds.</div>
              </div>
            </div>
          ) : (
            <></>
          )}
          <Button
            variant="primary"
            size="lg"
            isFullWidth
            onClick={onSubmit}
            isLoading={isSubmitLoading}
            disabled={isReviewDisabled}
          >
            Review transfer
          </Button>
        </Box>
      }
      contentAlign="left"
    />
  );
};
