import { Button, Input, Modal, Notification } from "@stellar/design-system";
import { useEffect, useState } from "react";

import { ErrorWithExtras } from "components/ErrorWithExtras";
import { formatDateTime } from "helpers/formatIntlDateTime";
import { validateAllowedIPs } from "helpers/validateIPs";
import { parseAllowedIPs } from "helpers/parseIPs";
import { usePrevious } from "hooks/usePrevious";
import {
  ApiKeyFormFields,
  INITIAL_PERMISSIONS,
  PermissionState,
  PermissionLevel,
  convertToApiPermissions,
  hasAnyPermissions,
  parseExistingPermissions,
} from "components/ApiKeyFormFields/ApiKeyFormFields";

import { UpdateApiKeyRequest } from "api/updateApiKey";
import { ApiKey } from "types";

import "./styles.scss";

interface EditApiKeyModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (apiKeyId: string, updateData: UpdateApiKeyRequest) => void;
  onResetQuery: () => void;
  isLoading: boolean;
  errorMessage?: string;
  apiKey?: ApiKey;
}

type FormData = {
  allowedIPs: string;
  permissions: PermissionState;
};

export const EditApiKeyModal: React.FC<EditApiKeyModalProps> = ({
  visible,
  onClose,
  onSubmit,
  onResetQuery,
  isLoading,
  errorMessage,
  apiKey,
}) => {
  const [formData, setFormData] = useState<FormData>({
    allowedIPs: "",
    permissions: { ...INITIAL_PERMISSIONS },
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const previousVisible = usePrevious(visible);

  useEffect(() => {
    if (visible && apiKey) {
      const allowedIpsString = Array.isArray(apiKey.allowed_ips)
        ? apiKey.allowed_ips.join("\n")
        : apiKey.allowed_ips || "";

      const permissions = parseExistingPermissions(apiKey.permissions || []);

      setFormData({
        allowedIPs: allowedIpsString,
        permissions,
      });
      setFormErrors([]);
    } else if (previousVisible && !visible) {
      setFormData({
        allowedIPs: "",
        permissions: { ...INITIAL_PERMISSIONS },
      });
      setFormErrors([]);
    }
  }, [visible, apiKey, previousVisible]);

  const handleClose = () => {
    onClose();
  };

  const removeItemFromErrors = (id: string) => {
    setFormErrors(formErrors.filter((e) => e !== id));
  };

  const handleAllowedIPsChange = (value: string) => {
    if (errorMessage) {
      onResetQuery();
    }
    removeItemFromErrors("allowedIPs");
    if (!value.trim()) {
      setFormErrors((prev) => prev.filter((e) => e !== "allowedIPs"));
    }
    setFormData({
      ...formData,
      allowedIPs: value,
    });
  };

  const handlePermissionChange = (
    resource: keyof PermissionState,
    level: PermissionLevel,
  ) => {
    if (errorMessage) {
      onResetQuery();
    }
    removeItemFromErrors("permissions");

    const newPermissions = { ...formData.permissions };

    if (resource === "all" && level === "read_write") {
      Object.keys(newPermissions).forEach((key) => {
        if (key !== "all") {
          newPermissions[key as keyof PermissionState] = "none";
        }
      });
    } else if (
      resource !== "all" &&
      formData.permissions.all === "read_write"
    ) {
      newPermissions.all = "none";
    }

    newPermissions[resource] = level;

    setFormData({
      ...formData,
      permissions: newPermissions,
    });
  };

  const handleAllowedIPsBlur = () => {
    if (formData.allowedIPs.trim()) {
      const { isValid } = validateAllowedIPs(formData.allowedIPs);
      if (!isValid) {
        setFormErrors([
          ...formErrors.filter((e) => e !== "allowedIPs"),
          "allowedIPs",
        ]);
      }
    }
  };

  const validatePermissions = () => {
    if (!hasAnyPermissions(formData.permissions)) {
      if (!formErrors.includes("permissions")) {
        setFormErrors([...formErrors, "permissions"]);
      }
      return false;
    }
    return true;
  };

  const getAllowedIPsError = () => {
    if (formErrors.includes("allowedIPs")) {
      const { error } = validateAllowedIPs(formData.allowedIPs);
      return error || "Invalid IP format";
    }
    return undefined;
  };

  const canSubmit =
    formErrors.length === 0 &&
    hasAnyPermissions(formData.permissions) &&
    validateAllowedIPs(formData.allowedIPs).isValid;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!validatePermissions()) {
      return;
    }

    const ipValidation = validateAllowedIPs(formData.allowedIPs);
    if (!ipValidation.isValid) {
      setFormErrors([...formErrors, "allowedIPs"]);
      return;
    }

    if (!apiKey) {
      return;
    }

    const apiPermissions = convertToApiPermissions(formData.permissions);
    const allowedIPs = parseAllowedIPs(formData.allowedIPs);

    const updateData: UpdateApiKeyRequest = {
      permissions: apiPermissions,
      allowed_ips: allowedIPs.length > 0 ? allowedIPs : null,
    };

    onSubmit(apiKey.id, updateData);
  };

  if (!apiKey) {
    return null;
  }

  return (
    <Modal visible={visible} onClose={handleClose}>
      <Modal.Heading>Edit API Key</Modal.Heading>
      <form onSubmit={handleSubmit} onReset={handleClose}>
        <Modal.Body>
          <div className="EditApiKeyModal__description">
            Update the permissions and IP restrictions for this API key.
          </div>
          {errorMessage && (
            <Notification variant="error" title="Error">
              <ErrorWithExtras
                appError={{
                  message: errorMessage,
                }}
              />
            </Notification>
          )}

          <div className="EditApiKeyModal__form">
            <Input
              fieldSize="sm"
              id="name"
              name="name"
              type="text"
              label="Key name"
              value={apiKey.name}
              disabled
              note="Key name cannot be changed"
            />

            <Input
              fieldSize="sm"
              id="expiryDate"
              name="expiryDate"
              type="text"
              label="Expiration date"
              value={
                apiKey.expiry_date
                  ? formatDateTime(apiKey.expiry_date)
                  : "No expiration"
              }
              disabled
              note="Expiration date cannot be changed"
            />

            <ApiKeyFormFields
              allowedIPs={formData.allowedIPs}
              permissions={formData.permissions}
              onAllowedIPsChange={handleAllowedIPsChange}
              onAllowedIPsBlur={handleAllowedIPsBlur}
              onPermissionChange={handlePermissionChange}
              allowedIPsError={getAllowedIPsError()}
              permissionsError={
                formErrors.includes("permissions")
                  ? "At least one permission is required"
                  : undefined
              }
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
            disabled={!canSubmit}
            isLoading={isLoading}
          >
            Update key
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};
