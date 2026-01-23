import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { Button, Icon, Input, Link, Text } from "@stellar/design-system";

import { Box } from "@/components/Box";
import { EmbeddedWalletAssetLogo } from "@/components/EmbeddedWalletAssetLogo";
import { EmbeddedWalletModal } from "@/components/EmbeddedWalletModal";
import { useAmountAutoScale } from "@/components/EmbeddedWalletTransferModal/useAmountAutoScale";

import {
  useWalletDestinationChecks,
  type DestinationCheckStatus,
  type TrustlineCheckStatus,
} from "@/apiQueries/useWalletDestinationChecks";

import { formatAmountDisplay } from "@/helpers/formatAmountDisplay";
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

const TRUSTLINE_HELP_URL =
  "https://developers.stellar.org/docs/build/guides/basics/verify-trustlines";
const CREATE_ACCOUNT_HELP_URL =
  "https://developers.stellar.org/docs/build/guides/transactions/create-account";

const renderTrustlineHelp = (assetCodeLabel: string) => (
  <>
    The destination wallet needs a{" "}
    <Link
      href={TRUSTLINE_HELP_URL}
      target="_blank"
      rel="noreferrer"
      icon={<Icon.LinkExternal01 />}
      iconPosition="right"
    >
      trustline
    </Link>{" "}
    for {assetCodeLabel} to receive this asset.
  </>
);

const renderCreateAccountHelp = () => (
  <>
    This destination wallet does not exist yet. Learn how to{" "}
    <Link
      href={CREATE_ACCOUNT_HELP_URL}
      target="_blank"
      rel="noreferrer"
      icon={<Icon.LinkExternal01 />}
      iconPosition="right"
    >
      create a Stellar account
    </Link>
    .
  </>
);

type DestinationState = {
  error?: ReactNode;
  note?: ReactNode;
};

const getDestinationState = ({
  destination,
  isAddressValid,
  destinationStatus,
  trustlineStatus,
  assetCode,
}: {
  destination: string;
  isAddressValid: boolean;
  destinationStatus: DestinationCheckStatus;
  trustlineStatus: TrustlineCheckStatus;
  assetCode?: string;
}): DestinationState => {
  let note: ReactNode | undefined;
  if (destinationStatus === "checking") {
    note = "Checking account...";
  } else if (trustlineStatus === "checking") {
    note = "Checking trustline...";
  }

  let error: ReactNode | undefined;
  if (destination) {
    if (!isAddressValid) {
      error = "Invalid address";
    } else if (destinationStatus === "missing") {
      error = renderCreateAccountHelp();
    } else if (trustlineStatus === "missing" && assetCode) {
      error = renderTrustlineHelp(assetCode);
    } else if (destinationStatus === "error") {
      error = "Unable to verify account right now";
    } else if (trustlineStatus === "error") {
      error = "Unable to verify trustline right now";
    }
  }

  return { error, note };
};

type AssetOption = {
  id: string;
  code: string;
  issuer: string | null;
  balance: string;
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
  assetOptions: AssetOption[];
  selectedAssetId: string;
  onAssetChange: (assetId: string) => void;
  isSubmitDisabled: boolean;
  isSubmitLoading: boolean;
  isWalletReady: boolean;
  onReview: () => void;
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
  assetOptions,
  selectedAssetId,
  onAssetChange,
  isSubmitDisabled,
  isSubmitLoading,
  isWalletReady,
  onReview,
}: Props) => {
  const displayAmount = formatAmountDisplay(amount);
  const canPaste =
    typeof navigator !== "undefined" && typeof navigator.clipboard?.readText === "function";
  const numericAmount = Number.parseFloat(amount);
  const numericAvailableBalance = Number.parseFloat(availableBalance);
  const isAmountOverAvailableBalance =
    Number.isFinite(numericAmount) &&
    Number.isFinite(numericAvailableBalance) &&
    numericAmount > numericAvailableBalance;
  const formattedAvailableBalance = formatAmountDisplay(availableBalance);
  const isAddressValid = isValidWalletAddress(destination);
  const isClassicAddress = isClassicWalletAddress(destination);
  const shouldCheckDestination = Boolean(destination && isClassicAddress);
  const activeAsset = assetOptions.find((asset) => asset.id === selectedAssetId) ?? assetOptions[0];
  const activeAssetCode = activeAsset?.code ?? assetCode;
  const activeAssetIssuer = activeAsset?.issuer ?? null;
  const { destinationStatus, trustlineStatus } = useWalletDestinationChecks({
    destination,
    shouldCheckDestination,
    assetCode: activeAssetCode,
    assetIssuer: activeAssetIssuer,
  });
  const { error: destinationError, note: destinationNote } = getDestinationState({
    destination,
    isAddressValid,
    destinationStatus,
    trustlineStatus,
    assetCode: activeAssetCode,
  });
  const isAmountValid = Number.isFinite(numericAmount) && numericAmount > 0;
  const isAmountWithinBalance =
    !Number.isFinite(numericAmount) ||
    !Number.isFinite(numericAvailableBalance) ||
    !isAmountOverAvailableBalance;
  const isDestinationCheckInProgress = destinationStatus === "checking";
  const isDestinationMissing = destinationStatus === "missing";
  const isTrustlineCheckInProgress = trustlineStatus === "checking";
  const isTrustlineMissing = trustlineStatus === "missing";
  const isReviewDisabled =
    isSubmitDisabled ||
    !isAddressValid ||
    isDestinationCheckInProgress ||
    isDestinationMissing ||
    isTrustlineCheckInProgress ||
    isTrustlineMissing ||
    !isAmountValid ||
    !isAmountWithinBalance;
  const hasValidationError = Boolean(destinationError) || isAmountOverAvailableBalance;
  const isInputDisabled = !isWalletReady || isSubmitLoading;
  const isAmountEditable = !isInputDisabled;
  const isPasteDisabled = !canPaste || isInputDisabled;
  const isMaxDisabled = isInputDisabled || !Number(availableBalance);
  const amountInputRef = useRef<HTMLSpanElement | null>(null);
  const pendingCaretRef = useRef<number | null>(null);
  const [isAssetMenuOpen, setIsAssetMenuOpen] = useState(false);
  const assetButtonRef = useRef<HTMLButtonElement | null>(null);
  const assetMenuRef = useRef<HTMLDivElement | null>(null);
  const isAssetSelectorDisabled = isInputDisabled || assetOptions.length <= 1;

  const { amountRowRef, amountMeasureRef, assetMeasureRef } = useAmountAutoScale({
    isOpen,
    displayAmount,
    assetCode: activeAssetCode,
    assetButtonRef,
  });

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      const target = event.target as Node;
      if (assetMenuRef.current?.contains(target) || assetButtonRef.current?.contains(target)) {
        return;
      }
      setIsAssetMenuOpen(false);
    },
    [setIsAssetMenuOpen],
  );

  const handleClose = () => {
    setIsAssetMenuOpen(false);
    onAmountChange("");
    onDestinationChange("");
    onClose();
  };

  const handleReviewClick = () => {
    setIsAssetMenuOpen(false);
    onReview();
  };

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

  useLayoutEffect(() => {
    if (isAssetMenuOpen) {
      document.addEventListener("pointerup", handleClickOutside);
    } else {
      document.removeEventListener("pointerup", handleClickOutside);
    }

    return () => {
      document.removeEventListener("pointerup", handleClickOutside);
    };
  }, [handleClickOutside, isAssetMenuOpen]);

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
      onClose={handleClose}
      title="Transfer to wallet"
      modalAlign="bottom"
      titleAlign="center"
      content={
        <Box gap="xl">
          <Box gap="xs">
            <div className="EmbeddedWalletTransferModal__amountField">
              <div className="EmbeddedWalletTransferModal__amountHeader">
                <div className="EmbeddedWalletTransferModal__amountRow" ref={amountRowRef}>
                  <span
                    id="wallet-transfer-amount"
                    className="EmbeddedWalletTransferModal__amountInput"
                    data-error={isAmountOverAvailableBalance}
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
                      const insertedLeadingZero =
                        rawValue.startsWith(".") && nextValue?.startsWith("0.");
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
                      if (insertedLeadingZero && pendingCaretRef.current !== null) {
                        pendingCaretRef.current += 1;
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
                  <button
                    type="button"
                    className="EmbeddedWalletTransferModal__assetButton"
                    onClick={() => setIsAssetMenuOpen((open) => !open)}
                    disabled={isAssetSelectorDisabled}
                    data-open={isAssetMenuOpen}
                    aria-haspopup="listbox"
                    aria-expanded={isAssetMenuOpen}
                    aria-label="Select asset"
                    ref={assetButtonRef}
                  >
                    <span className="EmbeddedWalletTransferModal__assetButtonCode">
                      {activeAssetCode}
                    </span>
                    <Icon.ChevronDown className="EmbeddedWalletTransferModal__assetButtonChevron" />
                  </button>
                </div>
                <button
                  type="button"
                  className="EmbeddedWalletTransferModal__maxButton"
                  onClick={() => {
                    const formattedBalance = formatAmountDisplay(availableBalance);
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
              <span
                className="EmbeddedWalletTransferModal__amountInput EmbeddedWalletTransferModal__amountMeasure"
                ref={amountMeasureRef}
                aria-hidden="true"
              />
              <span
                className="EmbeddedWalletTransferModal__assetMeasure"
                ref={assetMeasureRef}
                aria-hidden="true"
              />
              {isAssetMenuOpen ? (
                <div
                  className="EmbeddedWalletTransferModal__assetMenu"
                  ref={assetMenuRef}
                  role="listbox"
                >
                  {assetOptions.map((asset) => {
                    const isSelected = asset.id === selectedAssetId;
                    const formattedBalance = formatAmountDisplay(asset.balance);

                    return (
                      <button
                        key={asset.id}
                        type="button"
                        className="EmbeddedWalletTransferModal__assetOption"
                        data-selected={isSelected}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onAssetChange(asset.id);
                          setIsAssetMenuOpen(false);
                          requestAnimationFrame(() => amountInputRef.current?.focus());
                        }}
                        disabled={isInputDisabled}
                      >
                        <span className="EmbeddedWalletTransferModal__assetOptionIcon">
                          <EmbeddedWalletAssetLogo assetCode={asset.code} size="sm" />
                        </span>
                        <span className="EmbeddedWalletTransferModal__assetOptionInfo">
                          <span className="EmbeddedWalletTransferModal__assetOptionLabel">
                            {asset.code}
                          </span>
                        </span>
                        <span className="EmbeddedWalletTransferModal__assetOptionBalance">
                          {formattedBalance} {asset.code}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
            <Text size="sm" as="p">
              <span
                className="EmbeddedWalletTransferModal__availableBalance"
                data-error={isAmountOverAvailableBalance}
              >
                {formattedAvailableBalance} {activeAssetCode} available
              </span>
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
              error={destinationError}
              note={destinationNote}
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
          {isClassicAddress && !hasValidationError ? (
            <div className="EmbeddedWalletTransferModal__warning">
              <span className="EmbeddedWalletTransferModal__warningIcon">
                <Icon.InfoCircle />
              </span>
              <div className="EmbeddedWalletTransferModal__warningText">
                <div className="EmbeddedWalletTransferModal__warningTitle">
                  Exchanges aren't supported yet
                </div>
                <div className="EmbeddedWalletTransferModal__warningMessage">
                  You can send funds only to Stellar wallets. Sending to an exchange may result in
                  lost funds.
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}
          <Button
            variant="primary"
            size="lg"
            isFullWidth
            onClick={handleReviewClick}
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
