import { useEffect, useState } from "react";
import { Button, Input, Modal, Notification, Select } from "@stellar/design-system";

import { usePrevious } from "hooks/usePrevious";
import { useRedux } from "hooks/useRedux";
import { ErrorWithExtras } from "components/ErrorWithExtras";

import { bridgeFieldLabels, bridgeFieldDescriptions } from "constants/bridgeIntegration";

import { BridgeIntegrationUpdate } from "types";

import "./styles.scss";

interface BridgeOptInModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: BridgeIntegrationUpdate) => void;
  isLoading: boolean;
  error?: any;
}

type KycType = "individual" | "business";

interface FormData {
  fullName: string;
  email: string;
  kycType: KycType;
}

const getInitialFormData = (
  userEmail: string,
  userFirstName: string,
  userLastName: string,
): FormData => ({
  fullName: `${userFirstName} ${userLastName}`.trim(),
  email: userEmail,
  kycType: "individual",
});

export const BridgeOptInModal: React.FC<BridgeOptInModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isLoading,
  error,
}) => {
  const { userAccount, profile } = useRedux("userAccount", "profile");
  const userEmail = userAccount.email;
  const userFirstName = profile.data?.firstName || "";
  const userLastName = profile.data?.lastName || "";

  const [formData, setFormData] = useState<FormData>(() =>
    getInitialFormData(userEmail, userFirstName, userLastName),
  );
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const previousVisible = usePrevious(visible);

  useEffect(() => {
    if (previousVisible && !visible) {
      setFormData(getInitialFormData(userEmail, userFirstName, userLastName));
      setFormErrors([]);
    }
  }, [visible, previousVisible, userEmail, userFirstName, userLastName]);

  // Update form data when modal opens or profile data changes
  useEffect(() => {
    if (visible) {
      setFormData(getInitialFormData(userEmail, userFirstName, userLastName));
    }
  }, [visible, userEmail, userFirstName, userLastName]);

  const itemHasError = (id: string): string | undefined => {
    if (formErrors.includes(id)) {
      switch (id) {
        case "fullName":
          return "Full Name is required";
        case "email":
          return "Email Address is required";
        default:
          return `${id} is required`;
      }
    }
    return undefined;
  };

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) return false; // Email is now required
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateFullName = (name: string): boolean => {
    if (!name.trim()) return false; // Full name is now required
    return name.trim().length > 0;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Remove error if user starts typing
    if (formErrors.includes(id)) {
      setFormErrors((prev) => prev.filter((error) => error !== id));
    }
  };

  const handleKycTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      kycType: value as KycType,
    }));
  };

  const handleValidate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    const newErrors = [...formErrors];

    // Remove current field error first
    const filteredErrors = newErrors.filter((error) => error !== id);

    // Validate email field
    if (id === "email" && !validateEmail(value)) {
      filteredErrors.push("email");
    }

    // Validate fullName field
    if (id === "fullName" && !validateFullName(value)) {
      filteredErrors.push("fullName");
    }

    setFormErrors(filteredErrors);
  };

  const canSubmit = (): boolean => {
    // Check for validation errors
    if (formErrors.length > 0) return false;

    // Both fields are now mandatory - check they exist and are valid
    if (!validateEmail(formData.email)) return false;
    if (!validateFullName(formData.fullName)) return false;

    return true;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Validate all required fields
    const errors: string[] = [];

    if (!validateEmail(formData.email)) {
      errors.push("email");
    }

    if (!validateFullName(formData.fullName)) {
      errors.push("fullName");
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    // Prepare submission data - all fields are now required
    const submissionData: BridgeIntegrationUpdate = {
      status: "OPTED_IN",
      email: formData.email.trim(),
      full_name: formData.fullName.trim(),
      kyc_type: formData.kycType,
    };

    onSubmit(submissionData);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal visible={visible} onClose={handleClose}>
      <Modal.Heading>Get Started with Bridge</Modal.Heading>

      <Modal.Body>
        <div className="BridgeOptInModal">
          {error && (
            <Notification variant="error" title="Error">
              <ErrorWithExtras appError={error} />
            </Notification>
          )}

          <div className="BridgeOptInModal__intro">
            <p>
              Bridge enables you to source liquidity via USD deposits that automatically convert to
              USDC on Stellar. Complete the form below to begin the integration process.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="BridgeOptInModal__form">
              <Input
                id="fullName"
                label={bridgeFieldLabels.FULL_NAME}
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleInputChange}
                onBlur={handleValidate}
                error={itemHasError("fullName")}
                note={bridgeFieldDescriptions.FULL_NAME}
                fieldSize="md"
                required
              />

              <Input
                id="email"
                label={bridgeFieldLabels.EMAIL}
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleValidate}
                error={itemHasError("email")}
                note={bridgeFieldDescriptions.EMAIL}
                fieldSize="md"
                required
              />

              <Select
                id="kycType"
                label={bridgeFieldLabels.KYC_TYPE}
                value={formData.kycType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleKycTypeChange(e.target.value)
                }
                note={bridgeFieldDescriptions.KYC_TYPE}
                fieldSize="md"
              >
                <option value="individual">{bridgeFieldLabels.INDIVIDUAL}</option>
                <option value="business">{bridgeFieldLabels.BUSINESS}</option>
              </Select>
            </div>
          </form>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="tertiary" onClick={handleClose} size="md">
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          onClick={handleSubmit}
          disabled={!canSubmit() || isLoading}
          isLoading={isLoading}
          size="md"
        >
          Continue with Bridge
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
