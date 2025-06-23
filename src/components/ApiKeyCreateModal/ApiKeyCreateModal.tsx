import { useEffect, useState } from "react";
import { Button, Input, Modal, Notification } from "@stellar/design-system";

import { ErrorWithExtras } from "components/ErrorWithExtras";
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
} from "components/ApiKeyFormFields/ApiKeyFormFields";

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

type FormData = {
  name: string;
  expiryDate: string;
  allowedIPs: string;
  permissions: PermissionState;
};

export const CreateApiKeyModal: React.FC<CreateApiKeyModalProps> = ({
  visible,
  onClose,
  onSubmit,
  onResetQuery,
  isLoading,
  errorMessage,
}) => {
  const getInitForm = (): FormData => ({
    name: "",
    expiryDate: "",
    allowedIPs: "",
    permissions: { ...INITIAL_PERMISSIONS },
  });

  const [formData, setFormData] = useState<FormData>(getInitForm());
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const previousVisible = usePrevious(visible);

  useEffect(() => {
    if (previousVisible && !visible) {
      setFormData(getInitForm());
      setFormErrors([]);
    }
  }, [visible, previousVisible]);

  const handleClose = () => {
    onClose();
  };

  const removeItemFromErrors = (id: string) => {
    setFormErrors(formErrors.filter((e) => e !== id));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (errorMessage) {
      onResetQuery();
    }
    removeItemFromErrors(event.target.id);
    setFormData({
      ...formData,
      [event.target.id]: event.target.value,
    });
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

  const handleValidate = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) {
      if (!formErrors.includes(event.target.id)) {
        setFormErrors([...formErrors, event.target.id]);
      }
    }
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

  const itemHasError = (id: string, label: string) => {
    return formErrors.includes(id) ? `${label} is required` : undefined;
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
    formData.name.trim() !== "" &&
    hasAnyPermissions(formData.permissions) &&
    validateAllowedIPs(formData.allowedIPs).isValid;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setFormErrors([...formErrors, "name"]);
      return;
    }

    if (!validatePermissions()) {
      return;
    }

    const ipValidation = validateAllowedIPs(formData.allowedIPs);
    if (!ipValidation.isValid) {
      setFormErrors([...formErrors, "allowedIPs"]);
      return;
    }

    const apiPermissions = convertToApiPermissions(formData.permissions);
    const allowedIPs = parseAllowedIPs(formData.allowedIPs);

    const apiKeyData: CreateApiKeyRequest = {
      name: formData.name.trim(),
      permissions: apiPermissions,
      expiry_date: formData.expiryDate
        ? new Date(formData.expiryDate).toISOString()
        : undefined,
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
              value={formData.name}
              onChange={handleInputChange}
              onBlur={handleValidate}
              error={itemHasError("name", "Key name")}
              required
            />

            <Input
              fieldSize="sm"
              id="expiryDate"
              name="expiryDate"
              type="date"
              label="Expiration date (optional)"
              value={formData.expiryDate}
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
            Create new key
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};
