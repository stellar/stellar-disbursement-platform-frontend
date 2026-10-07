import { useEffect, useRef, useState } from "react";

import { Button, Input, Modal, Notification } from "@stellar/design-system";

import {
  ApiKeyFormFields,
  convertToApiPermissions,
} from "@/components/ApiKeyFormFields/ApiKeyFormFields";
import { ErrorWithExtras } from "@/components/ErrorWithExtras";

import { useDistributionWallets } from "@/apiQueries/useDistributionWallets";

import { parseAllowedIPs } from "@/helpers/parseIPs";

import { useApiKeyForm } from "@/hooks/useApiKeyForm";

import { AppError, CreateApiKeyRequest } from "@/types";

import "./styles.scss";

interface CreateApiKeyModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (apiKeyData: CreateApiKeyRequest) => void;
  onResetQuery: () => void;
  isLoading: boolean;
  appError?: AppError;
}

export const CreateApiKeyModal: React.FC<CreateApiKeyModalProps> = ({
  visible,
  onClose,
  onSubmit,
  onResetQuery,
  isLoading,
  appError,
}) => {
  const [name, setName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [nameError, setNameError] = useState(false);

  const {
    formData,
    setFormData,
    handleAllowedIPsChange,
    handlePermissionChange,
    handleAllowedIPsBlur,
    handleWalletToggle,
    validatePermissions,
    getAllowedIPsError,
    getPermissionsError,
    isFormValid,
  } = useApiKeyForm({ onResetQuery, appError });

  const { data: distributionWallets } = useDistributionWallets(visible);
  const hasPreselected = useRef(false);

  // Pre-selects every account the creator can reach, once, whenever the list arrives — the modal
  // remounts on each open, so the ref starts false again with it.
  useEffect(() => {
    if (!hasPreselected.current && distributionWallets) {
      hasPreselected.current = true;
      setFormData((prev) => ({
        ...prev,
        distributionWalletIds: distributionWallets.map((wallet) => wallet.id),
      }));
    }
  }, [distributionWallets, setFormData]);

  const handleClose = () => {
    onClose();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (appError) {
      onResetQuery();
    }

    if (event.target.id === "name") {
      setName(event.target.value);
      setNameError(false);
    } else if (event.target.id === "expiryDate") {
      setExpiryDate(event.target.value);
    }
  };

  const handleValidate = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.id === "name" && !event.target.value) {
      setNameError(true);
    }
  };

  const canSubmit = !nameError && name.trim() !== "" && isFormValid();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      setNameError(true);
      return;
    }

    if (!validatePermissions()) {
      return;
    }

    const apiPermissions = convertToApiPermissions(formData.permissions);
    const allowedIPs = parseAllowedIPs(formData.allowedIPs);

    const apiKeyData: CreateApiKeyRequest = {
      name: name.trim(),
      permissions: apiPermissions,
      expiry_date: expiryDate ? new Date(expiryDate).toISOString() : undefined,
      allowed_ips: allowedIPs.length > 0 ? allowedIPs : undefined,
      distribution_wallet_ids: formData.distributionWalletIds,
    };

    onSubmit(apiKeyData);
  };

  return (
    <Modal visible={visible} onClose={handleClose}>
      <Modal.Heading>Create new key</Modal.Heading>
      <form onSubmit={handleSubmit} onReset={handleClose} className="CreateApiKeyModal__form">
        <Modal.Body>
          <div className="CreateApiKeyModal__description">
            Generate an API key for authenticating with our API.
          </div>
          <div className="CreateApiKeyModal__permissionsDivider" />
          {appError && (
            <Notification variant="error" title="Error" isFilled={true}>
              <ErrorWithExtras appError={appError} />
            </Notification>
          )}

          <div className="CreateApiKeyModal__form">
            <Input
              fieldSize="sm"
              id="name"
              name="name"
              type="text"
              label="Key name"
              placeholder="Enter a descriptive name for this API key"
              value={name}
              onChange={handleInputChange}
              onBlur={handleValidate}
              error={nameError ? "Key name is required" : undefined}
              required
            />

            <Input
              fieldSize="sm"
              id="expiryDate"
              name="expiryDate"
              type="date"
              label="Expiration date (optional)"
              value={expiryDate}
              onChange={handleInputChange}
              note="Leave empty for no expiration"
            />

            <ApiKeyFormFields
              allowedIPs={formData.allowedIPs}
              permissions={formData.permissions}
              onAllowedIPsChange={handleAllowedIPsChange}
              onAllowedIPsBlur={handleAllowedIPsBlur}
              onPermissionChange={handlePermissionChange}
              allowedIPsError={getAllowedIPsError()}
              permissionsError={getPermissionsError()}
              distributionWallets={distributionWallets}
              selectedWalletIds={formData.distributionWalletIds}
              onWalletToggle={handleWalletToggle}
            />
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
            disabled={!canSubmit}
            isLoading={isLoading}
          >
            Create new key
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};
