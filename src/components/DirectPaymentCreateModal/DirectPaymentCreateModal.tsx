import { Button, Icon, Input, Modal, Notification, Select } from "@stellar/design-system";
import { useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { usePrevious } from "@/hooks/usePrevious";
import { useEffect, useMemo, useState } from "react";

import { useAllAssets } from "@/apiQueries/useAllAssets";
import { useSearchReceivers } from "@/apiQueries/useSearchReceivers";
import { useWallets } from "@/apiQueries/useWallets";

import { DirectPaymentConfirmation } from "@/components/DirectPaymentConfirmation/DirectPaymentConfirmation";
import { ErrorWithExtras } from "@/components/ErrorWithExtras";
import { SelectedReceiverInfo } from "@/components/SelectedReceiverInfo/SelectedReceiverInfo";

import { directPayment } from "@/constants/directPayment";
import { ApiAssetWithTrustline, ApiReceiver, CreateDirectPaymentRequest } from "@/types";

import "./styles.scss";

interface DirectPaymentCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (paymentData: CreateDirectPaymentRequest) => void;
  onResetQuery: () => void;
  isLoading: boolean;
  errorMessage?: string;
}

const INITIAL_FORM_DATA = {
  assetId: "",
  amount: "",
  receiverSearch: "",
  selectedReceiver: null as ApiReceiver | null,
  walletId: "",
  externalPaymentId: "",
};

export const DirectPaymentCreateModal: React.FC<DirectPaymentCreateModalProps> = ({
  visible,
  onClose,
  onSubmit,
  onResetQuery,
  isLoading,
  errorMessage,
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentDataToConfirm, setPaymentDataToConfirm] =
    useState<CreateDirectPaymentRequest | null>(null);
  const queryClient = useQueryClient();
  const isWalletAddress = (input: string) => input.startsWith("G") && input.length === 56;
  const debouncedReceiverSearch = useDebounce(
    formData.receiverSearch,
    directPayment.SEARCH_DEBOUNCE_MS,
  );
  const previousVisible = usePrevious(visible);
  const { data: allAssets } = useAllAssets({ enabled: true });
  const selectedAsset = useMemo(
    () =>
      allAssets?.find((asset) => asset.id === formData.assetId) as
        | ApiAssetWithTrustline
        | undefined,
    [allAssets, formData.assetId],
  );
  const { data: supportedWallets = [], isLoading: walletsLoading } = useWallets({
    supportedAssets: selectedAsset ? [selectedAsset.code] : [],
  });
  const { data: searchResults, isLoading: searchLoading } = useSearchReceivers(
    debouncedReceiverSearch,
    true,
  );
  const filteredWallets = useMemo(() => {
    if (!supportedWallets.length || !formData.assetId || !formData.selectedReceiver) {
      return [];
    }

    const receiverWalletIds = formData.selectedReceiver.wallets.map((w) => w.wallet.id);
    return supportedWallets.filter(
      (wallet) => wallet.enabled && receiverWalletIds.includes(wallet.id),
    );
  }, [supportedWallets, formData.assetId, formData.selectedReceiver]);
  const isWalletFieldDisabled = !formData.selectedReceiver || walletsLoading;
  const isWalletFieldLoading = walletsLoading && Boolean(formData.selectedReceiver);
  const isReceiverSearchLoading =
    searchLoading && debouncedReceiverSearch.trim().length >= directPayment.SEARCH_MIN_CHARS;
  const getWalletFieldNote = (): string => {
    if (!formData.selectedReceiver) return "Select a receiver first";
    if (isWalletFieldLoading) return "Loading compatible wallets…";
    if (filteredWallets.length === 0) return "No compatible wallets available for this receiver";
    return `${filteredWallets.length} compatible wallet(s) available`;
  };

  const isAmountValid =
    formData.amount.trim() !== "" && !isNaN(Number(formData.amount)) && Number(formData.amount) > 0;
  const isReceiverValid =
    formData.receiverSearch.trim() !== "" &&
    (isWalletAddress(formData.receiverSearch) || Boolean(formData.selectedReceiver));
  const isWalletValid = isWalletAddress(formData.receiverSearch)
    ? true
    : Boolean(formData.walletId);
  const isSubmitEnabled = Boolean(
    formData.assetId && isAmountValid && isReceiverValid && isWalletValid,
  );

  useEffect(() => {
    if (previousVisible && !visible) {
      setFormData(INITIAL_FORM_DATA);
      setFormErrors({});
      setShowConfirmation(false);
      setPaymentDataToConfirm(null);
    }
  }, [visible, previousVisible]);

  const handleClose = () => {
    if (showConfirmation) {
      setShowConfirmation(false);
      setPaymentDataToConfirm(null);
    } else {
      onClose();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (errorMessage) {
      onResetQuery();
    }

    const { id, value } = event.target;

    if (formErrors[id]) {
      setFormErrors((prev) => ({ ...prev, [id]: "" }));
    }

    if (id === "assetId") {
      setFormData((prev) => ({
        ...prev,
        assetId: value,
        receiverSearch: "",
        selectedReceiver: null,
        walletId: "",
      }));
      setFormErrors((prev) => ({
        ...prev,
        receiverSearch: "",
        walletId: "",
      }));
      // Clear any cached receiver search results when changing asset or clearing the field
      queryClient.removeQueries({ queryKey: ["receivers", "search"] });
      return;
    }

    if (id === "receiverSearch") {
      const shouldClearReceiver = formData.selectedReceiver && value !== formData.receiverSearch;

      setFormData((prev) => ({
        ...prev,
        receiverSearch: value,
        selectedReceiver: shouldClearReceiver ? null : prev.selectedReceiver,
        walletId: "",
      }));
      setFormErrors((prev) => ({ ...prev, walletId: "" }));
      if (value.trim().length < directPayment.SEARCH_MIN_CHARS) {
        // Proactively remove cached results so we don't show stale data
        queryClient.removeQueries({ queryKey: ["receivers", "search"] });
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleReceiverSelect = (receiver: ApiReceiver) => {
    setFormData((prev) => ({
      ...prev,
      receiverSearch: getReceiverDisplayInfo(receiver, formData.receiverSearch),
      selectedReceiver: receiver,
      walletId: "",
    }));
    setFormErrors((prev) => ({ ...prev, receiverSearch: "" }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    const isAddr = isWalletAddress(formData.receiverSearch);
    const selectedWallet = supportedWallets.find((w) => w.id === formData.walletId);

    const paymentData: CreateDirectPaymentRequest = {
      amount: formData.amount.trim(),
      asset: {
        id: selectedAsset?.id,
        code: selectedAsset?.code,
        issuer: selectedAsset?.issuer,
      },
      receiver: isAddr
        ? { wallet_address: formData.receiverSearch.trim() }
        : { id: formData.selectedReceiver!.id },
      ...(isAddr
        ? { wallet: { address: formData.receiverSearch.trim() } }
        : selectedWallet && { wallet: { id: selectedWallet.id } }),
      ...(formData.externalPaymentId.trim() && {
        external_payment_id: formData.externalPaymentId.trim(),
      }),
    };

    setPaymentDataToConfirm(paymentData);
    setShowConfirmation(true);
  };

  const handleConfirmPayment = () => {
    if (paymentDataToConfirm) {
      onSubmit(paymentDataToConfirm);
    }
  };

  const getReceiverDisplayInfo = (receiver: ApiReceiver, searchQuery: string): string => {
    const query = searchQuery.toLowerCase();
    if (receiver.email?.toLowerCase().includes(query)) return receiver.email;
    if (receiver.phone_number?.includes(query)) return receiver.phone_number;
    if (receiver.external_id?.toLowerCase().includes(query)) return receiver.external_id;
    return receiver.phone_number || receiver.email || receiver.external_id || "";
  };

  const showReceiverField = Boolean(formData.assetId);
  const isReceiverWalletAddress = isWalletAddress(formData.receiverSearch);
  const showWalletField = formData.assetId && !isReceiverWalletAddress;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.assetId) errors.assetId = "Asset selection is required";
    if (!formData.amount.trim()) {
      errors.amount = "Amount is required";
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      errors.amount = "Amount must be a valid positive number";
    }
    if (!formData.receiverSearch.trim()) {
      errors.receiverSearch = "Receiver is required";
    } else if (!isWalletAddress(formData.receiverSearch) && !formData.selectedReceiver) {
      errors.receiverSearch =
        "Please select a receiver from search results or enter a valid wallet address";
    }
    if (!isWalletAddress(formData.receiverSearch) && !formData.walletId) {
      errors.walletId = "Wallet selection is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const renderSearchResults = () => {
    if (!formData.receiverSearch || formData.selectedReceiver) return null;

    if (isReceiverSearchLoading) {
      return (
        <div className="DirectPaymentCreateModal__searchResults">
          <div className="DirectPaymentCreateModal__searchResult">Searching...</div>
        </div>
      );
    }

    if (
      !isReceiverWalletAddress &&
      formData.receiverSearch &&
      debouncedReceiverSearch.trim().length >= directPayment.SEARCH_MIN_CHARS &&
      searchResults?.data?.length === 0
    ) {
      return (
        <div className="DirectPaymentCreateModal__noResults">
          No receivers found. Make sure the receiver exists or enter a wallet address.
        </div>
      );
    }

    if (
      debouncedReceiverSearch.trim().length >= directPayment.SEARCH_MIN_CHARS &&
      searchResults?.data &&
      searchResults.data.length > 0
    ) {
      return (
        <div className="DirectPaymentCreateModal__searchResults">
          <div className="DirectPaymentCreateModal__searchResults__content">
            {searchResults.data.slice(0, directPayment.MAX_SEARCH_RESULTS).map((receiver) => {
              const isSelected = formData.selectedReceiver?.id === receiver.id;
              return (
                <div
                  key={receiver.id}
                  className="DirectPaymentCreateModal__searchResult"
                  onClick={() => handleReceiverSelect(receiver)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleReceiverSelect(receiver);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select receiver ${getReceiverDisplayInfo(receiver, formData.receiverSearch)}`}
                >
                  <div>
                    <div className="DirectPaymentCreateModal__searchResultMain">
                      {getReceiverDisplayInfo(receiver, formData.receiverSearch)}
                    </div>
                    <div className="DirectPaymentCreateModal__searchResultSub">
                      ID: {receiver.id.slice(0, directPayment.RECEIVER_ID_PREVIEW_LENGTH)}… •{" "}
                      {receiver.wallets.length} wallet(s)
                    </div>
                  </div>
                  {isSelected && <Icon.CheckCircle />}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  const renderWalletOptions = () => {
    return filteredWallets.map((wallet) => {
      const recvWallet = formData.selectedReceiver!.wallets.find((w) => w.wallet.id === wallet.id);
      const addr = recvWallet?.stellar_address || "";
      const shortAddr = addr && `${addr.slice(0, 4)}…${addr.slice(-4)}`;
      const label = `${wallet.name}${shortAddr ? ` (${shortAddr})` : ""}`;

      return (
        <option key={wallet.id} value={wallet.id}>
          {label}
        </option>
      );
    });
  };

  return (
    <Modal visible={visible} onClose={handleClose}>
      <Modal.Heading>
        {showConfirmation ? "Confirm Direct Payment" : "Create A Direct Payment"}
      </Modal.Heading>
      {showConfirmation ? (
        <>
          <Modal.Body>
            {errorMessage && (
              <Notification variant="error" title="Error">
                <ErrorWithExtras appError={{ message: errorMessage }} />
              </Notification>
            )}
            {paymentDataToConfirm && (
              <DirectPaymentConfirmation
                paymentData={paymentDataToConfirm}
                selectedReceiver={formData.selectedReceiver}
                receiverSearch={formData.receiverSearch}
              />
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              size="md"
              variant="tertiary"
              onClick={() => setShowConfirmation(false)}
              disabled={isLoading}
            >
              Back
            </Button>
            <Button
              size="md"
              variant="primary"
              onClick={handleConfirmPayment}
              disabled={isLoading}
              isLoading={isLoading}
            >
              Confirm Payment
            </Button>
          </Modal.Footer>
        </>
      ) : (
        <form onSubmit={handleSubmit} onReset={handleClose}>
          <Modal.Body>
            <div className="DirectPaymentCreateModal__description">
              Send a single payment directly to a receiver via email, phone number, or wallet
              address.
            </div>
            {errorMessage && (
              <Notification variant="error" title="Error">
                <ErrorWithExtras appError={{ message: errorMessage }} />
              </Notification>
            )}

            <div className="DirectPaymentCreateModal__form">
              {/* Asset Selection */}
              <Select
                fieldSize="sm"
                id="assetId"
                label="Asset"
                value={formData.assetId}
                onChange={handleInputChange}
                error={formErrors.assetId}
                note={
                  selectedAsset &&
                  `Available balance: ${selectedAsset?.balance} ${selectedAsset?.code}`
                }
                required
              >
                <option value="">Select asset</option>
                {allAssets?.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.code}{" "}
                    {asset.code !== "XLM" &&
                      `(${asset.issuer.slice(0, directPayment.ASSET_ISSUER_PREVIEW_LENGTH / 2)}…${asset.issuer.slice(-directPayment.ASSET_ISSUER_PREVIEW_LENGTH / 2)})`}
                  </option>
                ))}
              </Select>

              {/* Amount */}
              <Input
                fieldSize="sm"
                id="amount"
                name="amount"
                type="text"
                label="Amount"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={handleInputChange}
                error={formErrors.amount}
                rightElement={
                  selectedAsset?.code ? (
                    <span className="DirectPaymentCreateModal__currency">{selectedAsset.code}</span>
                  ) : undefined
                }
                disabled={!formData.assetId}
                required
              />

              {/* Receiver Search */}
              <div
                className="DirectPaymentCreateModal__fieldWrapper"
                data-visible={showReceiverField}
              >
                <div className="DirectPaymentCreateModal__fieldWrapper__content">
                  <Input
                    fieldSize="sm"
                    id="receiverSearch"
                    label="Receiver"
                    placeholder="Search by email, phone, or enter wallet address (GXXX...)"
                    infoText="Search results appear after entering at least 3 characters"
                    tooltipPlacement="top-start"
                    value={formData.receiverSearch}
                    onChange={handleInputChange}
                    error={formErrors.receiverSearch}
                    note={isReceiverWalletAddress && "Wallet address detected"}
                    required
                  />

                  {formData.selectedReceiver && !isReceiverWalletAddress && (
                    <SelectedReceiverInfo receiver={formData.selectedReceiver} />
                  )}

                  {renderSearchResults()}
                </div>
              </div>

              {/* Wallet Selection */}
              <div
                className="DirectPaymentCreateModal__fieldWrapper"
                data-visible={showReceiverField && showWalletField}
              >
                <div className="DirectPaymentCreateModal__fieldWrapper__content">
                  <Select
                    fieldSize="sm"
                    id="walletId"
                    label="Wallet"
                    value={formData.walletId}
                    onChange={handleInputChange}
                    error={formErrors.walletId}
                    disabled={isWalletFieldDisabled}
                    note={getWalletFieldNote()}
                    required
                  >
                    <option value="">Select wallet</option>
                    {renderWalletOptions()}
                  </Select>
                </div>
              </div>

              {/* External Payment ID */}
              <div
                className="DirectPaymentCreateModal__fieldWrapper"
                data-visible={showReceiverField}
              >
                <div className="DirectPaymentCreateModal__fieldWrapper__content">
                  <Input
                    fieldSize="sm"
                    id="externalPaymentId"
                    name="externalPaymentId"
                    type="text"
                    infoText="An identifier for the payment defined by your organization"
                    tooltipPlacement="top-start"
                    label="Enter external payment ID (optional)"
                    placeholder="Enter external payment ID"
                    value={formData.externalPaymentId}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button size="md" variant="tertiary" type="reset" disabled={isLoading}>
              Cancel
            </Button>
            <Button
              size="md"
              variant="primary"
              type="submit"
              disabled={!isSubmitEnabled}
              isLoading={isLoading}
            >
              Submit
            </Button>
          </Modal.Footer>
        </form>
      )}
    </Modal>
  );
};
