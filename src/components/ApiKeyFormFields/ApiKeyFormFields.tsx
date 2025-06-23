import { Heading, Select, Textarea } from "@stellar/design-system";
import { API_KEY_PERMISSION_RESOURCES } from "constants/apiKeyPermissions";

import "./styles.scss";

export type PermissionLevel = "none" | "read" | "read_write";

export type PermissionState = {
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

export const INITIAL_PERMISSIONS: PermissionState = {
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

interface ApiKeyFormFieldsProps {
  allowedIPs: string;
  permissions: PermissionState;
  onAllowedIPsChange: (value: string) => void;
  onAllowedIPsBlur: () => void;
  onPermissionChange: (
    resource: keyof PermissionState,
    level: PermissionLevel,
  ) => void;
  allowedIPsError?: string;
  permissionsError?: string;
}

export const ApiKeyFormFields: React.FC<ApiKeyFormFieldsProps> = ({
  allowedIPs,
  permissions,
  onAllowedIPsChange,
  onAllowedIPsBlur,
  onPermissionChange,
  allowedIPsError,
  permissionsError,
}) => {
  const isAllReadWrite = permissions.all === "read_write";

  return (
    <>
      <Textarea
        fieldSize="sm"
        id="allowedIPs"
        name="allowedIPs"
        label="Allowed IP addresses (optional)"
        placeholder="192.168.1.1&#10;10.0.0.0/24&#10;172.16.0.0/16"
        value={allowedIPs}
        onChange={(e) => onAllowedIPsChange(e.target.value)}
        onBlur={onAllowedIPsBlur}
        error={allowedIPsError}
        note="Enter IPv4 addresses or CIDR blocks, one per line or comma-separated. Leave empty to allow access from any IP."
        rows={3}
        className="ApiKeyFormFields__allowedIPs"
      />

      <div className="ApiKeyFormFields__permissions">
        <Heading
          as="h4"
          size="xs"
          className="ApiKeyFormFields__permissionsHeading"
        >
          Permissions
        </Heading>

        {permissionsError && (
          <div className="ApiKeyFormFields__permissionsError">
            {permissionsError}
          </div>
        )}

        <div className="ApiKeyFormFields__permissionsList">
          <div className="ApiKeyFormFields__permissionRow">
            <span className="ApiKeyFormFields__permissionLabel ApiKeyFormFields__permissionLabel--bold">
              All
            </span>
            <div className="ApiKeyFormFields__permissionSelect">
              <Select
                id="permission-all"
                fieldSize="sm"
                value={permissions.all}
                onChange={(e) =>
                  onPermissionChange("all", e.target.value as PermissionLevel)
                }
              >
                <option value="none">None</option>
                <option value="read">Read</option>
                <option value="read_write">Read & Write</option>
              </Select>
            </div>
          </div>

          <div
            className={`ApiKeyFormFields__resourcePermissions ${
              isAllReadWrite
                ? "ApiKeyFormFields__resourcePermissions--disabled"
                : ""
            }`}
          >
            {API_KEY_PERMISSION_RESOURCES.map(({ key, label, hasWrite }) => (
              <div key={key} className="ApiKeyFormFields__permissionRow">
                <span className="ApiKeyFormFields__permissionLabel">
                  {label}
                </span>
                <div className="ApiKeyFormFields__permissionSelect">
                  <Select
                    id={`permission-${key}`}
                    fieldSize="sm"
                    value={permissions[key as keyof PermissionState]}
                    onChange={(e) =>
                      onPermissionChange(
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
    </>
  );
};

export const convertToApiPermissions = (
  permissions: PermissionState,
): string[] => {
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

export const hasAnyPermissions = (permissions: PermissionState): boolean => {
  return Object.values(permissions).some((level) => level !== "none");
};

export const parseExistingPermissions = (
  permissions: string[],
): PermissionState => {
  const state = { ...INITIAL_PERMISSIONS };

  const hasReadAll = permissions.includes("read:all");
  const hasWriteAll = permissions.includes("write:all");

  if (hasReadAll && hasWriteAll) {
    state.all = "read_write";
    return state;
  } else if (hasReadAll) {
    state.all = "read";
    return state;
  }

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
