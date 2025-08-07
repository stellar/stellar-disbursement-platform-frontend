import { useEffect, useState } from "react";
import { Button, Input, Modal, Notification } from "@stellar/design-system";

import { ErrorWithExtras } from "components/ErrorWithExtras";
import {
  ApiKeyFormFields,
  convertToApiPermissions,
} from "components/ApiKeyFormFields/ApiKeyFormFields";

import { useApiKeyForm } from "hooks/useApiKeyForm";
import { usePrevious } from "hooks/usePrevious";

import { parseAllowedIPs } from "helpers/parseIPs";

import { CreateApiKeyRequest } from "types";

import "./styles.scss";

interface CreateApiKeyModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (apiKeyData: CreateApiKeyRequest) => void;
  onResetQuery: () => void;
  isLoading: boolean;
  errorMessage?: string;
}

export const CreateApiKeyModal: React.FC<CreateApiKeyModalProps> = ({
  visible,
  onClose,
  onSubmit,
  onResetQuery,
  isLoading,
  errorMessage,
}) => {
  const [name, setName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [nameError, setNameError] = useState(false);

  const {
    formData,
    handleAllowedIPsChange,
    handlePermissionChange,
    handleAllowedIPsBlur,
    validatePermissions,
    getAllowedIPsError,
    getPermissionsError,
    isFormValid,
    resetForm,
  } = useApiKeyForm({ onResetQuery, errorMessage });

  const previousVisible = usePrevious(visible);

  useEffect(() => {
    if (previousVisible && !visible) {
      setName("");
      setExpiryDate("");
      setNameError(false);
      resetForm();
    }
  }, [visible, previousVisible, resetForm]);

  const handleClose = () => {
    onClose();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (errorMessage) {
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
    };

    onSubmit(apiKeyData);
  };

  return (
    <Modal visible={visible} onClose={handleClose}>
      <Modal.Heading>Create new key</Modal.Heading>
      <form onSubmit={handleSubmit} onReset={handleClose}>
        <Modal.Body>
          <div className="CreateApiKeyModal__description">
            Generate an API key for authenticating with our API.
          </div>
          <div className="CreateApiKeyModal__permissionsDivider" />
          {errorMessage && (
            <Notification variant="error" title="Error">
              <ErrorWithExtras
                appError={{
                  message: errorMessage,
                }}
              />
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
