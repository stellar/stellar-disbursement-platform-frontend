import { useEffect, useState } from "react";
import {
  Button,
  Heading,
  Input,
  Modal,
  Notification,
  Select,
} from "@stellar/design-system";

import { usePrevious } from "hooks/usePrevious";
import { ErrorWithExtras } from "components/ErrorWithExtras";
import { formatDateTime } from "helpers/formatIntlDateTime";

import { ApiKey } from "types";
import { UpdateApiKeyRequest } from "api/updateApiKey";

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

  const parseExistingPermissions = (permissions: string[]): PermissionState => {
    const state = { ...INITIAL_PERMISSIONS };

    // Check for "all" permissions
    const hasReadAll = permissions.includes("read:all");
    const hasWriteAll = permissions.includes("write:all");

    if (hasReadAll && hasWriteAll) {
      state.all = "read_write";
      return state; // If all permissions, return early
    } else if (hasReadAll) {
      state.all = "read";
      return state;
    }

    // Parse individual permissions
    const resourceMap: Record<string, keyof PermissionState> = {
      disbursements: "disbursements",
      receivers: "receivers",
      payments: "payments",
      organization: "organization",
      users: "users",
      wallets: "wallets",
      statistics: "statistics",
      exports: "exports",
    };

    Object.entries(resourceMap).forEach(([resource, key]) => {
      const hasRead = permissions.includes(`read:${resource}`);
      const hasWrite = permissions.includes(`write:${resource}`);

      if (hasRead && hasWrite) {
        state[key] = "read_write";
      } else if (hasRead) {
        state[key] = "read";
      }
    });

    return state;
  };

  useEffect(() => {
    if (visible && apiKey) {
      // Initialize form with existing API key data
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

  const itemHasError = (id: string) => {
    if (id === "allowedIPs" && formErrors.includes(id)) {
      const { error } = validateAllowedIPs();
      return error || "Invalid IP format";
    }
    return undefined;
  };

  const canSubmit =
    formErrors.length === 0 &&
    hasAnyPermissions() &&
    validateAllowedIPs().isValid;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!validatePermissions()) {
      return;
    }

    const ipValidation = validateAllowedIPs();
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

  const isAllReadWrite = formData.permissions.all === "read_write";

  if (!apiKey) {
    return null;
  }

  return (
    <Modal visible={visible} onClose={handleClose}>
      <Modal.Heading>Edit API Key</Modal.Heading>
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

          <div className="EditApiKeyModal__form">
            {/* Read-only fields */}
            <div className="EditApiKeyModal__readOnlySection">
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
            </div>

            {/* Editable fields */}
            <div className="EditApiKeyModal__allowedIPs">
              <label htmlFor="allowedIPs" className="EditApiKeyModal__label">
                Allowed IP addresses (optional)
              </label>
              <textarea
                id="allowedIPs"
                name="allowedIPs"
                value={formData.allowedIPs}
                onChange={handleInputChange}
                onBlur={handleValidate}
                placeholder="192.168.1.1&#10;10.0.0.0/24&#10;172.16.0.0/16"
                className={`EditApiKeyModal__textarea ${
                  formErrors.includes("allowedIPs")
                    ? "EditApiKeyModal__textarea--error"
                    : ""
                }`}
              />
              {formErrors.includes("allowedIPs") && (
                <div className="EditApiKeyModal__error">
                  {itemHasError("allowedIPs")}
                </div>
              )}
              <div className="EditApiKeyModal__note">
                Enter IPv4 addresses or CIDR blocks, one per line or
                comma-separated. Leave empty to allow access from any IP.
              </div>
            </div>

            <div className="EditApiKeyModal__permissions">
              <Heading
                as="h4"
                size="xs"
                className="EditApiKeyModal__permissionsHeading"
              >
                Permissions
              </Heading>
              {formErrors.includes("permissions") && (
                <div className="EditApiKeyModal__permissionsError">
                  At least one permission is required
                </div>
              )}

              <div className="EditApiKeyModal__permissionsList">
                <div className="EditApiKeyModal__permissionRow">
                  <span className="EditApiKeyModal__permissionLabel EditApiKeyModal__permissionLabel--bold">
                    All
                  </span>
                  <div className="EditApiKeyModal__permissionSelect">
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
                  className={`EditApiKeyModal__resourcePermissions ${
                    isAllReadWrite
                      ? "EditApiKeyModal__resourcePermissions--disabled"
                      : ""
                  }`}
                >
                  {[
                    {
                      key: "disbursements",
                      label: "Disbursements",
                      hasWrite: true,
                    },
                    { key: "receivers", label: "Receivers", hasWrite: true },
                    { key: "payments", label: "Payments", hasWrite: true },
                    {
                      key: "organization",
                      label: "Organization",
                      hasWrite: true,
                    },
                    { key: "users", label: "Users", hasWrite: true },
                    { key: "wallets", label: "Wallets", hasWrite: true },
                    { key: "statistics", label: "Statistics", hasWrite: false },
                    { key: "exports", label: "Exports", hasWrite: false },
                  ].map(({ key, label, hasWrite }) => (
                    <div key={key} className="EditApiKeyModal__permissionRow">
                      <span className="EditApiKeyModal__permissionLabel">
                        {label}
                      </span>
                      <div className="EditApiKeyModal__permissionSelect">
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
                  ))}
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
            Update key
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};
