import { Button, Icon, Input, Modal, Notification, Select, Text } from "@stellar/design-system";
import { useEffect, useState } from "react";

import { useVerificationTypes } from "@/apiQueries/useVerificationTypes";
import {
  CustomDateInput,
  CustomYearMonthInput,
} from "@/components/CustomDateInputs/CustomDateInputs";
import { ErrorWithExtras } from "@/components/ErrorWithExtras";
import { ReceiverConfirmation } from "@/components/ReceiverConfirmation/ReceiverConfirmation";
import { shortenAccountKey } from "@/helpers/shortenAccountKey";
import { validateVerificationField } from "@/helpers/validateVerificationFields";
import { isContractAddress, isValidWalletAddress } from "@/helpers/walletValidate";
import { useDebounce } from "@/hooks/useDebounce";
import { usePrevious } from "@/hooks/usePrevious";
import { AppError, CreateReceiverRequest, VerificationFieldMap } from "@/types";

import "./styles.scss";

interface ReceiverCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (receiverData: CreateReceiverRequest) => void;
  onResetQuery: () => void;
  isLoading: boolean;
  appError?: AppError;
}

interface VerificationEntry {
  id: string;
  type: string;
  value: string;
}

interface AddedVerification {
  id: string;
  type: string;
  value: string;
}

interface AddedWallet {
  id: string;
  address: string;
  memo: string;
}

const INITIAL_FORM_DATA = {
  email: "",
  phoneNumber: "",
  externalId: "",
  currentWallet: {
    id: "current-wallet",
    address: "",
    memo: "",
  } as AddedWallet,
  addedWallets: [] as AddedWallet[],
  currentVerification: {
    id: "current-verification",
    type: "",
    value: "",
  } as VerificationEntry,
  addedVerifications: [] as AddedVerification[],
};

export const ReceiverCreateModal: React.FC<ReceiverCreateModalProps> = ({
  visible,
  onClose,
  onSubmit,
  onResetQuery,
  isLoading,
  appError,
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [receiverDataToConfirm, setReceiverDataToConfirm] = useState<CreateReceiverRequest | null>(
    null,
  );

  const previousVisible = usePrevious(visible);
  const { data: verificationTypes = [] } = useVerificationTypes();

  const debouncedWalletAddress = useDebounce(formData.currentWallet.address, 500);

  useEffect(() => {
    if (previousVisible && !visible) {
      setFormData(INITIAL_FORM_DATA);
      setFormErrors({});
      setShowConfirmation(false);
      setReceiverDataToConfirm(null);
    }
  }, [visible, previousVisible, onResetQuery]);

  useEffect(() => {
    if (!debouncedWalletAddress.trim()) {
      setFormErrors((prev) => ({ ...prev, walletAddress: "" }));
      return;
    }

    const isValid = isValidWalletAddress(debouncedWalletAddress);

    if (!isValid) {
      setFormErrors((prev) => ({
        ...prev,
        walletAddress:
          "Please enter a valid Stellar wallet or contract address (GXXX... or CXXX... format)",
      }));
    } else {
      setFormErrors((prev) => ({ ...prev, walletAddress: "" }));
    }
  }, [debouncedWalletAddress]);

  const handleClose = () => {
    if (showConfirmation) {
      setShowConfirmation(false);
      setReceiverDataToConfirm(null);
    } else {
      onClose();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (appError) {
      onResetQuery();
    }

    const { id, value } = event.target;

    if (formErrors[id]) {
      setFormErrors((prev) => ({ ...prev, [id]: "" }));
    }

    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleVerificationTypeChange = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      currentVerification: { ...prev.currentVerification, type, value: "" },
    }));

    // Clear verification value error when type changes
    if (formErrors.currentVerificationValue) {
      setFormErrors((prev) => ({ ...prev, currentVerificationValue: "" }));
    }
  };

  const validateVerificationValue = (type: string, value: string): string | null => {
    const result = validateVerificationField(type as any, value);
    return result.errorMessage || null;
  };

  const handleVerificationValueChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      currentVerification: { ...prev.currentVerification, value },
    }));

    // Clear existing error if there was one
    if (formErrors.currentVerificationValue) {
      setFormErrors((prev) => ({ ...prev, currentVerificationValue: "" }));
    }

    // Real-time validation when both type and value are present
    if (formData.currentVerification.type && value.trim()) {
      const validationError = validateVerificationValue(formData.currentVerification.type, value);
      if (validationError) {
        setFormErrors((prev) => ({ ...prev, currentVerificationValue: validationError }));
      }
    }
  };

  const addVerification = () => {
    if (!formData.currentVerification.type || !formData.currentVerification.value.trim()) {
      return;
    }

    // Validate the verification value before adding
    const validationError = validateVerificationValue(
      formData.currentVerification.type,
      formData.currentVerification.value,
    );

    if (validationError) {
      setFormErrors((prev) => ({
        ...prev,
        currentVerificationValue: validationError,
      }));
      return;
    }

    setFormErrors((prev) => ({ ...prev, currentVerificationValue: "" }));

    const newVerification: AddedVerification = {
      id: `verification-${Date.now()}`,
      type: formData.currentVerification.type,
      value: formData.currentVerification.value.trim(),
    };

    setFormData((prev) => ({
      ...prev,
      addedVerifications: [...prev.addedVerifications, newVerification],
      currentVerification: { id: "current-verification", type: "", value: "" },
    }));
  };

  const removeVerification = (verificationId: string) => {
    setFormData((prev) => ({
      ...prev,
      addedVerifications: prev.addedVerifications.filter((v) => v.id !== verificationId),
    }));
  };

  const getAvailableVerificationTypes = () => {
    const usedTypes = formData.addedVerifications.map((v) => v.type);
    const availableTypes = verificationTypes.filter((type) => !usedTypes.includes(type));

    // If DATE_OF_BIRTH is already added, hide YEAR_MONTH and vice versa
    const hasDateOfBirth = usedTypes.includes("DATE_OF_BIRTH");
    const hasYearMonth = usedTypes.includes("YEAR_MONTH");

    if (hasDateOfBirth) {
      return availableTypes.filter((type) => type !== "YEAR_MONTH");
    }

    if (hasYearMonth) {
      return availableTypes.filter((type) => type !== "DATE_OF_BIRTH");
    }

    return availableTypes;
  };

  const getVerificationInputConfig = (verificationType: string) => {
    switch (verificationType) {
      case "DATE_OF_BIRTH":
        return { type: "text" as const, placeholder: "YYYY-MM-DD" };
      case "YEAR_MONTH":
        return { type: "text" as const, placeholder: "YYYY-MM" };
      default:
        return { type: "text" as const, placeholder: "Enter value" };
    }
  };

  const handleWalletAddressChange = (value: string) => {
    setFormData((prev) => {
      const shouldClearMemo = isContractAddress(value);

      return {
        ...prev,
        currentWallet: {
          ...prev.currentWallet,
          address: value,
          memo: shouldClearMemo ? "" : prev.currentWallet.memo,
        },
      };
    });
  };

  const handleWalletMemoChange = (value: string) => {
    setFormData((prev) => {
      if (isContractAddress(prev.currentWallet.address)) {
        return prev;
      }

      return {
        ...prev,
        currentWallet: { ...prev.currentWallet, memo: value },
      };
    });
  };

  const getCurrentWalletAddress = () => formData?.currentWallet?.address?.trim();

  const isWalletDuplicate = (walletAddress: string, existingWallets: AddedWallet[]) => {
    return existingWallets.some(
      (wallet) => wallet.address.toLowerCase() === walletAddress.toLowerCase(),
    );
  };

  const addWallet = () => {
    const walletAddress = getCurrentWalletAddress();

    if (!walletAddress || !isValidWalletAddress(walletAddress)) {
      return;
    }

    if (isWalletDuplicate(walletAddress, formData.addedWallets)) {
      setFormErrors((prev) => ({
        ...prev,
        walletAddress: "This wallet address is already added to the list",
      }));
      return;
    }

    setFormErrors((prev) => ({
      ...prev,
      walletAddress: "",
    }));

    const newWallet: AddedWallet = {
      id: `wallet-${Date.now()}`,
      address: walletAddress,
      memo: formData.currentWallet.memo.trim(),
    };

    setFormData((prev) => ({
      ...prev,
      addedWallets: [...prev.addedWallets, newWallet],
      currentWallet: { id: "current-wallet", address: "", memo: "" },
    }));
  };

  const removeWallet = (walletId: string) => {
    setFormData((prev) => ({
      ...prev,
      addedWallets: prev.addedWallets.filter((w) => w.id !== walletId),
    }));
  };

  // Check if minimum requirements are met for submit button
  const hasContactInfo = formData.email.trim() !== "" || formData.phoneNumber.trim() !== "";
  const hasExternalId = formData.externalId.trim() !== "";
  const hasVerifications = formData.addedVerifications.length > 0;
  const hasWallets = formData.addedWallets.length > 0;
  const hasMinimumRequirements =
    hasContactInfo && hasExternalId && (hasVerifications || hasWallets);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email or phone is required
    if (!formData.email.trim() && !formData.phoneNumber.trim()) {
      errors.email = "Either email or phone number must be provided";
      errors.phoneNumber = "Either email or phone number must be provided";
    }

    // Email validation
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation (basic)
    if (formData.phoneNumber.trim() && formData.phoneNumber.trim().length < 10) {
      errors.phoneNumber = "Please enter a valid phone number";
    }

    // External ID is required
    if (!formData.externalId.trim()) {
      errors.externalId = "External ID is required";
    }

    // At least one verification or wallet is required
    const hasVerifications = formData.addedVerifications.length > 0;
    const hasWallets = formData.addedWallets.length > 0;

    if (!hasVerifications && !hasWallets) {
      errors.verifications = "Add at least one verification or wallet address to create a receiver";
    }

    // Validate current verification if it has data
    if (formData.currentVerification.type && !formData.currentVerification.value.trim()) {
      errors.currentVerificationValue = "Verification value is required";
    }
    if (!formData.currentVerification.type && formData.currentVerification.value.trim()) {
      errors.currentVerificationType = "Verification type is required";
    }

    // Validate current verification value based on type
    if (formData.currentVerification.type && formData.currentVerification.value.trim()) {
      const validationError = validateVerificationValue(
        formData.currentVerification.type,
        formData.currentVerification.value,
      );
      if (validationError) {
        errors.currentVerificationValue = validationError;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    const receiverData: CreateReceiverRequest = {
      email: formData.email.trim(),
      phone_number: formData.phoneNumber.trim(),
      external_id: formData.externalId.trim(),
      verifications: formData.addedVerifications.map((v) => ({
        type: v.type,
        value: v.value,
      })),
      wallets: formData.addedWallets.map((w) => ({
        address: w.address,
        ...(w.memo.trim() && { memo: w.memo.trim() }),
      })),
    };

    setReceiverDataToConfirm(receiverData);
    setShowConfirmation(true);
  };

  const handleConfirmReceiver = () => {
    if (receiverDataToConfirm) {
      onSubmit(receiverDataToConfirm);
    }
  };

  const renderVerificationFields = () => {
    return (
      <div className="ReceiverCreateModal__section">
        <Text size="md" as="h4" className="ReceiverCreateModal__section">
          Verifications
        </Text>

        {/* Verification type selection row */}
        <div className="ReceiverCreateModal__input-row ReceiverCreateModal__input-row--verification-type">
          <Select
            id="current-verification-type"
            fieldSize="sm"
            value={formData.currentVerification.type}
            onChange={(e) => handleVerificationTypeChange(e.target.value)}
            infoText="Supported verifications: PIN: 4-8 alphanumeric only, National ID Number: <50 characters, Date of Birth: YYYY-MM-DD or YYYY MM DD, Year-Month: YYYY-MM or YYYY MM"
          >
            <option value="">Select type</option>
            {getAvailableVerificationTypes().map((type) => (
              <option key={type} value={type}>
                {VerificationFieldMap[type] || type}
              </option>
            ))}
          </Select>
        </div>

        {/* Verification value input row - always visible but disabled until type selected */}
        <div className="ReceiverCreateModal__input-row ReceiverCreateModal__input-row--verification-value">
          {formData.currentVerification.type === "DATE_OF_BIRTH" ? (
            <CustomDateInput
              value={formData.currentVerification.value}
              onChange={handleVerificationValueChange}
              placeholder="YYYY-MM-DD"
              error={formErrors.currentVerificationValue}
              disabled={!formData.currentVerification.type}
            />
          ) : formData.currentVerification.type === "YEAR_MONTH" ? (
            <CustomYearMonthInput
              value={formData.currentVerification.value}
              onChange={handleVerificationValueChange}
              placeholder="YYYY-MM"
              error={formErrors.currentVerificationValue}
              disabled={!formData.currentVerification.type}
            />
          ) : (
            <Input
              id="current-verification-value"
              fieldSize="sm"
              {...getVerificationInputConfig(formData.currentVerification.type)}
              value={formData.currentVerification.value}
              onChange={(e) => handleVerificationValueChange(e.target.value)}
              error={formErrors.currentVerificationValue}
              disabled={!formData.currentVerification.type}
            />
          )}

          <Button
            size="sm"
            variant="primary"
            type="button"
            onClick={addVerification}
            disabled={
              !formData.currentVerification.type ||
              !formData.currentVerification.value.trim() ||
              !!formErrors.currentVerificationValue
            }
          >
            Add
          </Button>
        </div>

        {/* Added verifications as badges */}
        {formData.addedVerifications.length > 0 ? (
          <>
            <Text size="sm" as="p" className="ReceiverCreateModal__provided">
              Verifications provided:
            </Text>
            <div className="ReceiverCreateModal__verification-badges">
              {formData.addedVerifications.map((verification) => (
                <div key={verification.id} className="ReceiverCreateModal__verification-badge">
                  <Button
                    size="sm"
                    variant="tertiary"
                    icon={<Icon.X />}
                    isRounded={true}
                    onClick={() => removeVerification(verification.id)}
                  >
                    <span className="ReceiverCreateModal__verification-label">
                      {VerificationFieldMap[verification.type] || verification.type}:
                    </span>
                    <span className="ReceiverCreateModal__verification-value">
                      {verification.value}
                    </span>
                  </Button>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    );
  };

  const renderWalletFields = () => {
    const isCurrentWalletContract = isContractAddress(formData.currentWallet.address);

    return (
      <>
        {/* Wallet address input row */}
        <div className="ReceiverCreateModal__input-row ReceiverCreateModal__input-row--wallet-address">
          <Input
            id="current-wallet-address"
            fieldSize="sm"
            type="text"
            label="Wallet Address"
            placeholder="Enter Stellar wallet or contract address (GXXX... or CXXX...)"
            value={formData.currentWallet.address}
            onChange={(e) => handleWalletAddressChange(e.target.value)}
            error={formErrors.walletAddress}
          />
        </div>

        {/* Wallet memo input row */}
        <div className="ReceiverCreateModal__input-row ReceiverCreateModal__input-row--wallet-memo">
          <Input
            id="current-wallet-memo"
            fieldSize="sm"
            type="text"
            label="Wallet Memo (optional)"
            placeholder="Memo"
            value={formData.currentWallet.memo}
            onChange={(e) => handleWalletMemoChange(e.target.value)}
            className="ReceiverCreateModal__wallet-memo-field"
            disabled={isCurrentWalletContract}
            infoText={
              isCurrentWalletContract
                ? "Memos are not supported for contract addresses."
                : undefined
            }
          />

          <Button
            size="sm"
            variant="primary"
            type="button"
            onClick={addWallet}
            disabled={
              !formData.currentWallet.address.trim() ||
              !isValidWalletAddress(formData.currentWallet.address.trim())
            }
          >
            Add
          </Button>
        </div>

        {/* Added wallets as list */}
        {formData.addedWallets.length > 0 ? (
          <>
            <Text size="sm" as="p" className="ReceiverCreateModal__provided">
              Wallets provided:
            </Text>
            <div className="ReceiverCreateModal__verification-badges">
              {formData.addedWallets.map((wallet) => (
                <div key={wallet.id} className="ReceiverCreateModal__verification-badge">
                  <Button
                    size="sm"
                    variant="tertiary"
                    icon={<Icon.X />}
                    isRounded={true}
                    onClick={() => removeWallet(wallet.id)}
                  >
                    {shortenAccountKey(wallet.address, 8, 8)}
                    {wallet.memo ? ` (Memo: ${wallet.memo})` : null}
                  </Button>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </>
    );
  };

  return (
    <Modal visible={visible} onClose={handleClose}>
      <Modal.Heading>
        {showConfirmation ? "Confirm New Receiver" : "Create New Receiver"}
      </Modal.Heading>
      {showConfirmation ? (
        <>
          <Modal.Body>
            {appError ? (
              <Notification variant="error" title="Error" isFilled={true}>
                <ErrorWithExtras appError={appError} />
              </Notification>
            ) : null}
            {receiverDataToConfirm ? (
              <ReceiverConfirmation receiverData={receiverDataToConfirm} />
            ) : null}
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
              onClick={handleConfirmReceiver}
              isLoading={isLoading}
            >
              Confirm
            </Button>
          </Modal.Footer>
        </>
      ) : (
        <form onSubmit={handleSubmit} onReset={handleClose}>
          <div className="ReceiverCreateModal__content">
            <Modal.Body>
              {appError ? (
                <Notification variant="error" title="Error" isFilled={true}>
                  <ErrorWithExtras appError={appError} />
                </Notification>
              ) : null}

              <div className="ReceiverCreateModal__form">
                {/* Contact Information */}
                <div className="ReceiverCreateModal__section">
                  <Text size="md" as="h4" className="ReceiverCreateModal__section">
                    Contact Information
                  </Text>
                  {/* Instructions */}
                  <Text size="sm" as="p" className="ReceiverCreateModal__description">
                    Email or phone number is required to create a receiver. Both must be unique
                    across all receivers.
                  </Text>

                  <div className="ReceiverCreateModal__contact-inputs">
                    <Input
                      fieldSize="md"
                      id="email"
                      name="email"
                      type="email"
                      label="Email"
                      placeholder="Enter email address"
                      infoText="Email must be unique across all receivers"
                      value={formData.email}
                      onChange={handleInputChange}
                      error={formErrors.email}
                    />

                    <Input
                      fieldSize="md"
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      label="Phone Number"
                      placeholder="Enter phone number"
                      infoText="Phone number must be unique across all receivers"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      error={formErrors.phoneNumber}
                    />

                    <Input
                      fieldSize="md"
                      id="externalId"
                      name="externalId"
                      type="text"
                      label="External ID"
                      placeholder="Enter external ID"
                      infoText="An identifier for the receiver defined by your organization"
                      value={formData.externalId}
                      onChange={handleInputChange}
                      error={formErrors.externalId}
                    />
                  </div>
                </div>

                {/* Verifications Section */}
                <div className="ReceiverCreateModal__section">
                  <Text size="md" as="h4" className="ReceiverCreateModal__section">
                    Identity Verification
                  </Text>
                  <Text size="sm" as="p" className="ReceiverCreateModal__section-description">
                    Add at least one verification or wallet address to create a receiver.
                  </Text>
                  {renderVerificationFields()}
                </div>

                {/* Wallet Addresses */}
                <div className="ReceiverCreateModal__section">
                  <Text size="md" as="h4" className="ReceiverCreateModal__section">
                    Wallet Addresses
                  </Text>
                  {renderWalletFields()}
                </div>
              </div>
            </Modal.Body>
          </div>
          <Modal.Footer>
            <Button size="md" variant="tertiary" type="reset" disabled={isLoading}>
              Cancel
            </Button>
            <Button
              size="md"
              variant="primary"
              type="submit"
              disabled={!hasMinimumRequirements}
              isLoading={isLoading}
            >
              Review
            </Button>
          </Modal.Footer>
        </form>
      )}
    </Modal>
  );
};
