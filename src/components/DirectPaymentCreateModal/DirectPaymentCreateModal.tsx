import { useEffect, useState, useMemo } from "react";
import {
  Button,
  Input,
  Modal,
  Notification,
  Select,
  Icon,
} from "@stellar/design-system";
import { useDebounce } from "hooks/useDebounce";
import { usePrevious } from "hooks/usePrevious";

import { useAllAssets } from "apiQueries/useAllAssets";
import { useWallets } from "apiQueries/useWallets";
import { useSearchReceivers } from "apiQueries/useSearchReceivers";

import { ErrorWithExtras } from "components/ErrorWithExtras";
import { SelectedReceiverInfo } from "components/SelectedReceiverInfo/SelectedReceiverInfo";

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
  const debouncedReceiverSearch = useDebounce(formData.receiverSearch, 300);

  const { data: allAssets } = useAllAssets();

  const selectedAsset = allAssets?.find(
    (asset) => asset.id === formData.assetId,
  );

  const { data: supportedWallets = [], isLoading: walletsLoading } = useWallets(
    {
      supportedAssets: selectedAsset ? [selectedAsset.code] : [],
    },
  );

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
    }
  }, [visible, previousVisible]);

  const filteredWallets = useMemo(() => {
    if (
      !supportedWallets.length ||
      !formData.assetId ||
      !formData.selectedReceiver
    ) {
      return [];
    }

    const receiverWalletIds = formData.selectedReceiver.wallets.map(
      (w) => w.wallet.id,
    );

    return supportedWallets.filter(
      (wallet) => wallet.enabled && receiverWalletIds.includes(wallet.id),
    );
  }, [supportedWallets, formData.assetId, formData.selectedReceiver]);

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
      return;
    }

    if (id === "receiverSearch") {
      const shouldClearReceiver =
        formData.selectedReceiver && value !== formData.receiverSearch;

      setFormData((prev) => ({
        ...prev,
        receiverSearch: value,
        selectedReceiver: shouldClearReceiver ? null : prev.selectedReceiver,
        walletId: "",
      }));
      setFormErrors((prev) => ({ ...prev, walletId: "" }));
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
    if (receiver.email?.toLowerCase().includes(query)) return receiver.email;
    if (receiver.phone_number?.includes(query)) return receiver.phone_number;
    if (receiver.external_id?.toLowerCase().includes(query))
      return receiver.external_id;
    return (
      receiver.phone_number || receiver.email || receiver.external_id || ""
    );
  };

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
    } else if (!formData.selectedReceiver) {
      errors.receiverSearch = "Please select a receiver from search results";
    }
    if (!formData.walletId) {
      errors.walletId = "Wallet selection is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    const selectedWallet = supportedWallets.find(
      (w) => w.id === formData.walletId,
    );

    const paymentData: CreateDirectPaymentRequest = {
      amount: formData.amount.trim(),
      asset: {
        id: selectedAsset?.id,
        code: selectedAsset?.code,
        issuer: selectedAsset?.issuer,
      },
      receiver: { id: formData.selectedReceiver!.id },
      ...(selectedWallet && { wallet: { id: selectedWallet.id } }),
      ...(formData.externalPaymentId.trim() && {
        external_payment_id: formData.externalPaymentId.trim(),
      }),
    };

    onSubmit(paymentData);
  };

  const showWalletField = formData.assetId;
  const showReceiverField = Boolean(formData.assetId);

  return (
    <Modal visible={visible} onClose={handleClose}>
      <Modal.Heading>Create a direct payment</Modal.Heading>
      <form onSubmit={handleSubmit} onReset={handleClose}>
        <Modal.Body>
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
              required
            >
              <option value="">Select asset</option>
              {allAssets?.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.code}{" "}
                  {asset.code !== "XLM" &&
                    `(${asset.issuer.slice(0, 4)}…${asset.issuer.slice(-4)})`}
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
            <div
              className={`DirectPaymentCreateModal__fieldWrapper ${
                showReceiverField &&
                "DirectPaymentCreateModal__fieldWrapper--visible"
              }`}
            >
              <div>
                <Input
                  fieldSize="sm"
                  id="receiverSearch"
                  label="Receiver"
                  placeholder="Search by name, email, phone"
                  value={formData.receiverSearch}
                  onChange={handleInputChange}
                  error={formErrors.receiverSearch}
                  required
                />

                {formData.selectedReceiver && (
                  <SelectedReceiverInfo receiver={formData.selectedReceiver} />
                )}

                {formData.receiverSearch &&
                  !formData.selectedReceiver &&
                  searchResults?.data &&
                  searchResults?.data.length > 0 && (
                    <div className="DirectPaymentCreateModal__searchResults">
                      {searchResults!.data.slice(0, 5).map((receiver) => {
                        const isSelected =
                          formData.selectedReceiver?.id === receiver.id;
                        return (
                          <button
                            key={receiver.id}
                            type="button"
                            className="DirectPaymentCreateModal__searchResult"
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
                                ID: {receiver.id.slice(0, 8)}… •{" "}
                                {receiver.wallets.length} wallet(s)
                              </div>
                            </div>
                            {isSelected && <Icon.CheckCircle />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                {formData.receiverSearch &&
                  !formData.selectedReceiver &&
                  debouncedReceiverSearch &&
                  searchResults?.data?.length === 0 && (
                    <div className="DirectPaymentCreateModal__noResults">
                      No receivers found. Make sure the receiver exists.
                    </div>
                  )}
              </div>
            </div>

            {/* Wallet Selection */}
            <div
              className={`DirectPaymentCreateModal__fieldWrapper ${showWalletField && "DirectPaymentCreateModal__fieldWrapper--visible"}`}
            >
              <Select
                fieldSize="sm"
                id="walletId"
                label="Wallet"
                value={formData.walletId}
                onChange={handleInputChange}
                error={formErrors.walletId}
                disabled={!formData.selectedReceiver || walletsLoading}
                note={
                  !formData.selectedReceiver
                    ? "Select a receiver first"
                    : walletsLoading
                      ? "Loading wallets…"
                      : `${filteredWallets.length} compatible wallet(s) available`
                }
                required
              >
                <option value="">Select wallet</option>
                {filteredWallets.map((wallet) => {
                  const recvWallet = formData.selectedReceiver!.wallets.find(
                    (w) => w.wallet.id === wallet.id,
                  );
                  const addr = recvWallet?.stellar_address || "";
                  const shortAddr =
                    addr && `${addr.slice(0, 4)}…${addr.slice(-4)}`;
                  const label = `${wallet.name}${
                    shortAddr ? ` (${shortAddr})` : ""
                  }`;

                  return (
                    <option key={wallet.id} value={wallet.id}>
                      {label}
                    </option>
                  );
                })}
              </Select>
            </div>

            {/* External Payment ID */}
            <div
              className={`DirectPaymentCreateModal__fieldWrapper ${
                showReceiverField
                  ? "DirectPaymentCreateModal__fieldWrapper--visible"
                  : ""
              }`}
            >
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
