import { useEffect, useState, useMemo, useRef } from "react";
import {
  Button,
  Input,
  Modal,
  Notification,
  Select,
  Icon,
} from "@stellar/design-system";

import { ErrorWithExtras } from "components/ErrorWithExtras";

import { useAllAssets } from "apiQueries/useAllAssets";
import { useAllWallets } from "apiQueries/useWallets";
import { useSearchReceivers } from "apiQueries/useSearchReceivers";
import { usePrevious } from "hooks/usePrevious";

import { CreateDirectPaymentRequest, ApiReceiver } from "types";

import "./styles.scss";

interface DirectPaymentCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (paymentData: CreateDirectPaymentRequest) => void;
  onResetQuery: () => void;
  isLoading: boolean;
  errorMessage?: string;
}

export const DirectPaymentCreateModal: React.FC<
  DirectPaymentCreateModalProps
> = ({ visible, onClose, onSubmit, onResetQuery, isLoading, errorMessage }) => {
  const [formData, setFormData] = useState({
    assetId: "",
    amount: "",
    receiverSearch: "",
    selectedReceiver: null as ApiReceiver | null,
    walletId: "",
    externalPaymentId: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const receiverSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedReceiverSearch, setDebouncedReceiverSearch] = useState("");

  const { data: allAssets } = useAllAssets();
  const { data: allWallets } = useAllWallets();
  const { data: searchResults } = useSearchReceivers(debouncedReceiverSearch);

  const previousVisible = usePrevious(visible);

  useEffect(() => {
    if (previousVisible && !visible) {
      setFormData({
        assetId: "",
        amount: "",
        receiverSearch: "",
        selectedReceiver: null,
        walletId: "",
        externalPaymentId: "",
      });
      setFormErrors({});
      setDebouncedReceiverSearch("");
    }
  }, [visible, previousVisible]);

  useEffect(() => {
    if (receiverSearchTimeoutRef.current) {
      clearTimeout(receiverSearchTimeoutRef.current);
    }

    const timeout = setTimeout(() => {
      setDebouncedReceiverSearch(formData.receiverSearch);
    }, 300);

    receiverSearchTimeoutRef.current = timeout;

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [formData.receiverSearch]);

  const filteredWallets = useMemo(() => {
    if (!allWallets || !formData.assetId || !formData.selectedReceiver) {
      return [];
    }

    const selectedAsset = allAssets?.find(
      (asset) => asset.id === formData.assetId,
    );
    if (!selectedAsset) return [];

    const receiverWalletIds = formData.selectedReceiver.wallets.map(
      (w) => w.wallet.id,
    );

    return allWallets.filter((wallet) => {
      const supportsAsset = wallet.assets?.some(
        (asset) =>
          asset.id === selectedAsset.id ||
          (asset.code === selectedAsset.code &&
            asset.issuer === selectedAsset.issuer),
      );
      const isReceiverWallet = receiverWalletIds.includes(wallet.id);
      return wallet.enabled && supportsAsset && isReceiverWallet;
    });
  }, [allWallets, allAssets, formData.assetId, formData.selectedReceiver]);

  const handleClose = () => {
    onClose();
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
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
        [id]: value,
        receiverSearch: "",
        selectedReceiver: null,
        walletId: "",
      }));
      setFormErrors((prev) => ({
        ...prev,
        receiverSearch: "",
        walletId: "",
      }));
      setDebouncedReceiverSearch("");
      return;
    }

    if (id === "receiverSearch") {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
        selectedReceiver: null,
        walletId: "",
      }));
      setFormErrors((prev) => ({
        ...prev,
        walletId: "",
      }));
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

  const getReceiverDisplayInfo = (
    receiver: ApiReceiver,
    searchQuery: string,
  ) => {
    const query = searchQuery.toLowerCase();

    if (receiver.email && receiver.email.toLowerCase().includes(query)) {
      return receiver.email;
    }

    if (receiver.phone_number && receiver.phone_number.includes(query)) {
      return receiver.phone_number;
    }

    if (
      receiver.external_id &&
      receiver.external_id.toLowerCase().includes(query)
    ) {
      return receiver.external_id;
    }

    return receiver.phone_number || receiver.email || receiver.external_id;
  };

  const isWalletAddress = (input: string) => {
    return input.startsWith("G") && input.length === 56;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.assetId) {
      errors.assetId = "Asset selection is required";
    }

    if (!formData.amount.trim()) {
      errors.amount = "Amount is required";
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      errors.amount = "Amount must be a valid positive number";
    }

    if (!formData.receiverSearch.trim()) {
      errors.receiverSearch = "Receiver is required";
    } else if (
      !isWalletAddress(formData.receiverSearch) &&
      !formData.selectedReceiver
    ) {
      errors.receiverSearch =
        "Please select a receiver from search results or enter a valid wallet address";
    }

    if (!isWalletAddress(formData.receiverSearch) && !formData.walletId) {
      errors.walletId = "Wallet selection is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const selectedAsset = allAssets?.find(
      (asset) => asset.id === formData.assetId,
    );
    const selectedWallet = allWallets?.find(
      (wallet) => wallet.id === formData.walletId,
    );
    const isWalletAddr = isWalletAddress(formData.receiverSearch);

    const paymentData: CreateDirectPaymentRequest = {
      amount: formData.amount.trim(),
      asset: {
        id: selectedAsset?.id,
        code: selectedAsset?.code,
        issuer: selectedAsset?.issuer,
      },
      receiver: isWalletAddr
        ? {
            wallet_address: formData.receiverSearch.trim(),
          }
        : {
            id: formData.selectedReceiver?.id,
          },
      ...(isWalletAddr
        ? {
            wallet: {
              address: formData.receiverSearch.trim(),
            },
          }
        : selectedWallet?.id && {
            wallet: {
              id: selectedWallet.id,
            },
          }),
      ...(formData.externalPaymentId.trim() && {
        external_payment_id: formData.externalPaymentId.trim(),
      }),
    };

    onSubmit(paymentData);
  };

  const selectedAsset = allAssets?.find(
    (asset) => asset.id === formData.assetId,
  );
  const isReceiverWalletAddress = isWalletAddress(formData.receiverSearch);
  const showWalletField = formData.assetId && !isReceiverWalletAddress;
  const showReceiverField = Boolean(formData.assetId);

  return (
    <Modal visible={visible} onClose={handleClose}>
      <Modal.Heading>Create a direct payment</Modal.Heading>
      <form onSubmit={handleSubmit} onReset={handleClose}>
        <Modal.Body>
          {errorMessage && (
            <Notification variant="error" title="Error">
              <ErrorWithExtras
                appError={{
                  message: errorMessage,
                }}
              />
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
              required
            >
              <option value="">Select asset</option>
              {allAssets?.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.code}{" "}
                  {asset.issuer !== "native"
                    ? `(${asset.issuer.slice(0, 8)}...)`
                    : "(Native)"}
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
                  <span className="DirectPaymentCreateModal__currency">
                    {selectedAsset.code}
                  </span>
                ) : undefined
              }
              disabled={!formData.assetId}
              required
            />

            {/* Receiver Search */}
            {showReceiverField && (
              <div>
                <Input
                  fieldSize="sm"
                  id="receiverSearch"
                  label="Receiver"
                  placeholder="Search by name, email, phone, or enter wallet address (GXXX...)"
                  value={formData.receiverSearch}
                  onChange={handleInputChange}
                  error={formErrors.receiverSearch}
                  note={
                    isReceiverWalletAddress ? "Wallet address detected" : ""
                  }
                  required
                />

                {/* Search Results */}
                {!isReceiverWalletAddress &&
                  formData.receiverSearch &&
                  searchResults?.data &&
                  searchResults.data.length > 0 && (
                    <div className="DirectPaymentCreateModal__searchResults">
                      {searchResults.data.slice(0, 5).map((receiver) => {
                        const isSelected =
                          formData.selectedReceiver?.id === receiver.id;
                        return (
                          <button
                            key={receiver.id}
                            type="button"
                            className={`DirectPaymentCreateModal__searchResult`}
                            onClick={() => handleReceiverSelect(receiver)}
                          >
                            <div>
                              <div className="DirectPaymentCreateModal__searchResultMain">
                                {getReceiverDisplayInfo(
                                  receiver,
                                  formData.receiverSearch,
                                )}
                              </div>
                              <div className="DirectPaymentCreateModal__searchResultSub">
                                ID: {receiver.id.slice(0, 8)}... •{" "}
                                {receiver.wallets.length} wallet(s)
                              </div>
                            </div>
                            {isSelected && <Icon.CheckCircle />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                {!isReceiverWalletAddress &&
                  formData.receiverSearch &&
                  debouncedReceiverSearch &&
                  searchResults?.data &&
                  searchResults.data.length === 0 && (
                    <div className="DirectPaymentCreateModal__noResults">
                      No receivers found. Make sure the receiver exists or enter
                      a wallet address.
                    </div>
                  )}
              </div>
            )}

            {/* Wallet Selection */}
            {showWalletField && (
              <Select
                fieldSize="sm"
                id="walletId"
                label="Wallet"
                value={formData.walletId}
                onChange={handleInputChange}
                error={formErrors.walletId}
                disabled={!formData.selectedReceiver}
                note={
                  !formData.selectedReceiver
                    ? "Select a receiver first"
                    : `${filteredWallets.length} compatible wallet(s) available`
                }
                required
              >
                <option value="">Select wallet</option>
                {filteredWallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </option>
                ))}
              </Select>
            )}

            {/* External Payment ID */}
            <Input
              fieldSize="sm"
              id="externalPaymentId"
              name="externalPaymentId"
              type="text"
              label="External Payment ID (optional)"
              placeholder="Enter external payment ID"
              value={formData.externalPaymentId}
              onChange={handleInputChange}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            size="sm"
            variant="secondary"
            type="reset"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="tertiary"
            type="submit"
            disabled={isLoading}
            isLoading={isLoading}
          >
            Confirm payment
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};
