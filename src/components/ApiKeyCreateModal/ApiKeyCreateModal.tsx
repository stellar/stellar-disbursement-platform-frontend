import { useEffect, useState } from "react";
import {
  Button,
  Heading,
  Input,
  Modal,
  Notification,
  Select,
  Textarea,
} from "@stellar/design-system";

import { usePrevious } from "hooks/usePrevious";
import { ErrorWithExtras } from "components/ErrorWithExtras";

import { CreateApiKeyRequest } from "types";
import { API_KEY_PERMISSION_RESOURCES } from "constants/apiKeyPermissions";

import "./styles.scss";

interface CreateApiKeyModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (apiKeyData: CreateApiKeyRequest) => void;
  onResetQuery: () => void;
  isLoading: boolean;
  errorMessage?: string;
}

type PermissionLevel = "none" | "read" | "read_write";

type PermissionState = {
  all: PermissionLevel;
  disbursements: PermissionLevel;
  receivers: PermissionLevel;
  payments: PermissionLevel;
  organization: PermissionLevel;
  users: PermissionLevel;
  wallets: PermissionLevel;
  statistics: PermissionLevel;
  exports: PermissionLevel;
};

const INITIAL_PERMISSIONS: PermissionState = {
  all: "none",
  disbursements: "none",
  receivers: "none",
  payments: "none",
  organization: "none",
  users: "none",
  wallets: "none",
  statistics: "none",
  exports: "none",
};

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

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (errorMessage) {
      onResetQuery();
    }
    removeItemFromErrors(event.target.id);
    if (event.target.id === "allowedIPs") {
      const newValue = event.target.value;
      if (!newValue.trim()) {
        setFormErrors((prev) => prev.filter((e) => e !== "allowedIPs"));
      }
    }
    setFormData({
      ...formData,
      [event.target.id]: event.target.value,
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

  const parseAllowedIPs = (input: string): string[] => {
    if (!input.trim()) {
      return [];
    }

    const ips = input
      .split(/[\n,]/)
      .map((ip) => ip.trim())
      .filter((ip) => ip.length > 0);

    return ips;
  };

  const validateIP = (ip: string): boolean => {
    if (ip.includes("/")) {
      const parts = ip.split("/");
      if (parts.length !== 2) return false;

      const [ipPart, maskPart] = parts;
      const mask = parseInt(maskPart, 10);

      if (!isValidIPAddress(ipPart)) return false;

      return mask >= 0 && mask <= 32;
    } else {
      return isValidIPAddress(ip);
    }
  };

  const isValidIPAddress = (ip: string): boolean => {
    const ipv4Regex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
    if (ipv4Regex.test(ip)) {
      const parts = ip.split(".");
      return (
        parts.length === 4 &&
        parts.every((part) => {
          const num = parseInt(part, 10);
          return num >= 0 && num <= 255;
        })
      );
    }

    return false;
  };

  const validateAllowedIPs = (): { isValid: boolean; error?: string } => {
    const ips = parseAllowedIPs(formData.allowedIPs);

    if (ips.length === 0) {
      return { isValid: true };
    }

    for (const ip of ips) {
      if (!validateIP(ip)) {
        if (ip.includes("/")) {
          return { isValid: false, error: `Invalid CIDR: ${ip}` };
        } else {
          return { isValid: false, error: `Invalid IP: ${ip}` };
        }
      }
    }

    return { isValid: true };
  };

  const convertToApiPermissions = (permissions: PermissionState): string[] => {
    const apiPermissions: string[] = [];

    if (permissions.all === "read") {
      apiPermissions.push("read:all");
    } else if (permissions.all === "read_write") {
      apiPermissions.push("read:all", "write:all");
      return apiPermissions;
    }

    Object.entries(permissions).forEach(([resource, level]) => {
      if (resource === "all" || level === "none") return;

      if (level === "read") {
        apiPermissions.push(`read:${resource}`);
      } else if (level === "read_write") {
        if (resource === "statistics" || resource === "exports") {
          apiPermissions.push(`read:${resource}`);
        } else {
          apiPermissions.push(`read:${resource}`, `write:${resource}`);
        }
      }
    });

    return apiPermissions;
  };

  const hasAnyPermissions = (): boolean => {
    return Object.values(formData.permissions).some(
      (level) => level !== "none",
    );
  };

  const handleValidate = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!event.target.value) {
      if (!formErrors.includes(event.target.id)) {
        setFormErrors([...formErrors, event.target.id]);
      }
    }

    if (event.target.id === "allowedIPs" && event.target.value.trim()) {
      const { isValid } = validateAllowedIPs();
      if (!isValid) {
        setFormErrors([
          ...formErrors.filter((e) => e !== "allowedIPs"),
          "allowedIPs",
        ]);
      }
    } else if (event.target.id === "allowedIPs" && !event.target.value.trim()) {
      setFormErrors(formErrors.filter((e) => e !== "allowedIPs"));
    }
  };

  const validatePermissions = () => {
    if (!hasAnyPermissions()) {
      if (!formErrors.includes("permissions")) {
        setFormErrors([...formErrors, "permissions"]);
      }
      return false;
    }
    return true;
  };

  const itemHasError = (id: string, label: string) => {
    if (id === "allowedIPs" && formErrors.includes(id)) {
      const { error } = validateAllowedIPs();
      return error || "Invalid IP format";
    }
    return formErrors.includes(id) ? `${label} is required` : undefined;
  };

  const canSubmit =
    formErrors.length === 0 &&
    formData.name.trim() !== "" &&
    hasAnyPermissions() &&
    validateAllowedIPs().isValid;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setFormErrors([...formErrors, "name"]);
      return;
    }

    if (!validatePermissions()) {
      return;
    }

    const ipValidation = validateAllowedIPs();
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

  const isAllReadWrite = formData.permissions.all === "read_write";

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

            <Textarea
              fieldSize="sm"
              id="allowedIPs"
              name="allowedIPs"
              label="Allowed IP addresses (optional)"
              placeholder="192.168.1.1&#10;10.0.0.0/24&#10;172.16.0.0/16"
              value={formData.allowedIPs}
              onChange={handleInputChange}
              onBlur={handleValidate}
              error={itemHasError("allowedIPs", "Allowed IPs")}
              note="Enter IPv4 addresses or CIDR blocks, one per line or comma-separated. Leave empty to allow access from any IP."
              className="CreateApiKeyModal__allowedIPs"
            />

            <div className="CreateApiKeyModal__permissions">
              <Heading
                as="h4"
                size="xs"
                className="CreateApiKeyModal__permissionsHeading"
              >
                Permissions
              </Heading>

              <div className="CreateApiKeyModal__permissionsDivider" />

              {formErrors.includes("permissions") && (
                <div className="CreateApiKeyModal__permissionsError">
                  At least one permission is required
                </div>
              )}

              <div className="CreateApiKeyModal__permissionsList">
                <div className="CreateApiKeyModal__permissionRow">
                  <span className="CreateApiKeyModal__permissionLabel CreateApiKeyModal__permissionLabel--bold">
                    All
                  </span>
                  <div className="CreateApiKeyModal__permissionSelect">
                    <Select
                      id="permission-all"
                      fieldSize="sm"
                      value={formData.permissions.all}
                      onChange={(e) =>
                        handlePermissionChange(
                          "all",
                          e.target.value as PermissionLevel,
                        )
                      }
                    >
                      <option value="none">None</option>
                      <option value="read">Read</option>
                      <option value="read_write">Read & Write</option>
                    </Select>
                  </div>
                </div>

                <div
                  className={`CreateApiKeyModal__resourcePermissions ${
                    isAllReadWrite
                      ? "CreateApiKeyModal__resourcePermissions--disabled"
                      : ""
                  }`}
                >
                  {API_KEY_PERMISSION_RESOURCES.map(
                    ({ key, label, hasWrite }) => (
                      <div
                        key={key}
                        className="CreateApiKeyModal__permissionRow"
                      >
                        <span className="CreateApiKeyModal__permissionLabel">
                          {label}
                        </span>
                        <div className="CreateApiKeyModal__permissionSelect">
                          <Select
                            id={`permission-${key}`}
                            fieldSize="sm"
                            value={
                              formData.permissions[key as keyof PermissionState]
                            }
                            onChange={(e) =>
                              handlePermissionChange(
                                key as keyof PermissionState,
                                e.target.value as PermissionLevel,
                              )
                            }
                            disabled={isAllReadWrite}
                          >
                            <option value="none">None</option>
                            <option value="read">Read</option>
                            {hasWrite && (
                              <option value="read_write">Read & Write</option>
                            )}
                          </Select>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
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
