import { Button, Icon, Input, Modal, Notification, Select } from "@stellar/design-system";

import { usePrevious } from "@/hooks/usePrevious";
import { useEffect, useState } from "react";

import { useVerificationTypes } from "@/apiQueries/useVerificationTypes";
import { ErrorWithExtras } from "@/components/ErrorWithExtras";
import { ReceiverConfirmation } from "@/components/ReceiverConfirmation/ReceiverConfirmation";
import { shortenAccountKey } from "@/helpers/shortenAccountKey";
import { isValidWalletAddress } from "@/helpers/walletValidate";
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

  useEffect(() => {
    if (previousVisible && !visible) {
      setFormData(INITIAL_FORM_DATA);
      setFormErrors({});
      setShowConfirmation(false);
      setReceiverDataToConfirm(null);
    }
  }, [visible, previousVisible]);

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
  };

  const handleVerificationValueChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      currentVerification: { ...prev.currentVerification, value },
    }));
  };

  const addVerification = () => {
    if (!formData.currentVerification.type || !formData.currentVerification.value.trim()) {
      return;
    }

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

  const handleWalletAddressChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      currentWallet: { ...prev.currentWallet, address: value },
    }));

    if (formErrors.walletAddress) {
      setFormErrors((prev) => ({
        ...prev,
        walletAddress: "",
      }));
    }
  };

  const handleWalletMemoChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      currentWallet: { ...prev.currentWallet, memo: value },
    }));
  };

  const addWallet = () => {
    if (
      !formData.currentWallet.address.trim() ||
      !isValidWalletAddress(formData.currentWallet.address.trim())
    ) {
      return;
    }

    const walletAddress = formData.currentWallet.address.trim();

    const isDuplicate = formData.addedWallets.some(
      (wallet) => wallet.address.toLowerCase() === walletAddress.toLowerCase(),
    );

    if (isDuplicate) {
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
      switch (formData.currentVerification.type) {
        case "DATE_OF_BIRTH":
          if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.currentVerification.value.trim())) {
            errors.currentVerificationValue = "Date of birth must be in YYYY-MM-DD format";
          }
          break;
        case "YEAR_MONTH":
          if (!/^\d{4}-\d{2}$/.test(formData.currentVerification.value.trim())) {
            errors.currentVerificationValue = "Year-month must be in YYYY-MM format";
          }
          break;
        case "PIN":
          if (
            formData.currentVerification.value.trim().length < 4 ||
            formData.currentVerification.value.trim().length > 8
          ) {
            errors.currentVerificationValue = "PIN must be between 4 and 8 characters";
          }
          break;
        case "NATIONAL_ID_NUMBER":
          if (formData.currentVerification.value.trim().length > 50) {
            errors.currentVerificationValue = "National ID must be at most 50 characters";
          }
          break;
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
        <h4>Verifications</h4>

        {/* Current verification input row */}
        <div className="ReceiverCreateModal__input-row ReceiverCreateModal__input-row--verification">
          <Select
            id="current-verification-type"
            fieldSize="sm"
            value={formData.currentVerification.type}
            onChange={(e) => handleVerificationTypeChange(e.target.value)}
            error={formErrors.currentVerificationType}
            infoText="Supported verifications: PIN: 4-8 characters, National ID Number: <50 characters, Date of Birth: YYYY-MM-DD or YYYY-MM"
          >
            <option value="">Select type</option>
            {getAvailableVerificationTypes().map((type) => (
              <option key={type} value={type}>
                {VerificationFieldMap[type] || type}
              </option>
            ))}
          </Select>

          {formData.currentVerification.type === "DATE_OF_BIRTH" ? (
            <Input
              id="current-verification-value"
              fieldSize="sm"
              type="date"
              placeholder="YYYY-MM-DD"
              value={formData.currentVerification.value}
              onChange={(e) => handleVerificationValueChange(e.target.value)}
              error={formErrors.currentVerificationValue}
            />
          ) : formData.currentVerification.type === "YEAR_MONTH" ? (
            <Input
              id="current-verification-value"
              fieldSize="sm"
              type="month"
              placeholder="YYYY-MM"
              value={formData.currentVerification.value}
              onChange={(e) => handleVerificationValueChange(e.target.value)}
              error={formErrors.currentVerificationValue}
            />
          ) : (
            <Input
              id="current-verification-value"
              fieldSize="sm"
              type="text"
              placeholder="Enter value"
              value={formData.currentVerification.value}
              onChange={(e) => handleVerificationValueChange(e.target.value)}
              error={formErrors.currentVerificationValue}
            />
          )}

          <Button
            size="sm"
            variant="primary"
            type="button"
            onClick={addVerification}
            disabled={
              !formData.currentVerification.type || !formData.currentVerification.value.trim()
            }
          >
            Add
          </Button>
        </div>

        {/* Added verifications as badges */}
        {formData.addedVerifications.length > 0 && (
          <>
            <div className="ReceiverCreateModal__provided">
              <p>Verifications provided:</p>
            </div>
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
                    {`${VerificationFieldMap[verification.type] || verification.type}: ${verification.value}`}
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderWalletFields = () => {
    return (
      <>
        {/* Current wallet input row */}
        <div className="ReceiverCreateModal__input-row ReceiverCreateModal__input-row--wallet">
          <Input
            id="current-wallet-address"
            fieldSize="sm"
            type="text"
            label="Wallet Address"
            placeholder="Enter Stellar wallet address (GXXX...)"
            value={formData.currentWallet.address}
            onChange={(e) => handleWalletAddressChange(e.target.value)}
            error={formErrors.walletAddress}
          />

          <Input
            id="current-wallet-memo"
            fieldSize="sm"
            type="text"
            label="Wallet Memo (optional)"
            placeholder="Memo"
            value={formData.currentWallet.memo}
            onChange={(e) => handleWalletMemoChange(e.target.value)}
            className="ReceiverCreateModal__wallet-memo-field"
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
        {formData.addedWallets.length > 0 && (
          <>
            <div className="ReceiverCreateModal__provided">
              <p>Wallets provided:</p>
            </div>
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
                    {wallet.memo && ` (Memo: ${wallet.memo})`}
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
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
            {appError && (
              <Notification variant="error" title="Error">
                <ErrorWithExtras appError={appError} />
              </Notification>
            )}
            {receiverDataToConfirm && <ReceiverConfirmation receiverData={receiverDataToConfirm} />}
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
              disabled={isLoading}
              isLoading={isLoading}
            >
              Confirm
            </Button>
          </Modal.Footer>
        </>
      ) : (
        <form onSubmit={handleSubmit} onReset={handleClose}>
          <Modal.Body>
            {appError && (
              <Notification variant="error" title="Error">
                <ErrorWithExtras appError={appError} />
              </Notification>
            )}

            <div className="ReceiverCreateModal__form">
              {/* Instructions */}
              <div className="ReceiverCreateModal__description">
                <p>
                  Email or phone number is required to create a receiver. Both must be unique across
                  all receivers.
                </p>
              </div>

              {/* Contact Information */}
              <div className="ReceiverCreateModal__section">
                <h4>Contact Information</h4>
                <div className="ReceiverCreateModal__form-row">
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
                </div>
              </div>

              {/* External ID */}
              <div className="ReceiverCreateModal__section">
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

              {/* Verifications Section */}
              <div className="ReceiverCreateModal__section">
                <h4>Identity Verification</h4>
                <div className="ReceiverCreateModal__description">
                  Add at least one verification or wallet address to create a receiver.
                </div>
                {renderVerificationFields()}
              </div>

              {/* Wallet Addresses */}
              <div className="ReceiverCreateModal__section">
                <h4>Wallet Addresses</h4>
                {renderWalletFields()}
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
              disabled={!hasMinimumRequirements || isLoading}
              isLoading={isLoading}
            >
              Confirm
            </Button>
          </Modal.Footer>
        </form>
      )}
    </Modal>
  );
};
