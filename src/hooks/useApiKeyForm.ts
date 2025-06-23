import { useCallback, useState } from "react";
import {
  INITIAL_PERMISSIONS,
  PermissionLevel,
  PermissionState,
  hasAnyPermissions,
} from "components/ApiKeyFormFields/ApiKeyFormFields";
import { validateAllowedIPs } from "helpers/validateIPs";

interface UseApiKeyFormProps {
  onResetQuery: () => void;
  errorMessage?: string;
}

export interface ApiKeyFormState {
  allowedIPs: string;
  permissions: PermissionState;
}

export const useApiKeyForm = ({
  onResetQuery,
  errorMessage,
}: UseApiKeyFormProps) => {
  const [formData, setFormData] = useState<ApiKeyFormState>({
    allowedIPs: "",
    permissions: { ...INITIAL_PERMISSIONS },
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const removeItemFromErrors = useCallback((id: string) => {
    setFormErrors((prev) => prev.filter((e) => e !== id));
  }, []);

  const handleAllowedIPsChange = useCallback(
    (value: string) => {
      if (errorMessage) {
        onResetQuery();
      }
      removeItemFromErrors("allowedIPs");
      if (!value.trim()) {
        setFormErrors((prev) => prev.filter((e) => e !== "allowedIPs"));
      }
      setFormData((prev) => ({
        ...prev,
        allowedIPs: value,
      }));
    },
    [errorMessage, onResetQuery, removeItemFromErrors],
  );

  const handlePermissionChange = useCallback(
    (resource: keyof PermissionState, level: PermissionLevel) => {
      if (errorMessage) {
        onResetQuery();
      }
      removeItemFromErrors("permissions");

      setFormData((prev) => {
        const newPermissions = { ...prev.permissions };

        if (resource === "all" && level === "read_write") {
          Object.keys(newPermissions).forEach((key) => {
            if (key !== "all") {
              newPermissions[key as keyof PermissionState] = "none";
            }
          });
        } else if (
          resource !== "all" &&
          prev.permissions.all === "read_write"
        ) {
          newPermissions.all = "none";
        }

        newPermissions[resource] = level;

        return {
          ...prev,
          permissions: newPermissions,
        };
      });
    },
    [errorMessage, onResetQuery, removeItemFromErrors],
  );

  const handleAllowedIPsBlur = useCallback(() => {
    if (formData.allowedIPs.trim()) {
      const { isValid } = validateAllowedIPs(formData.allowedIPs);
      if (!isValid) {
        setFormErrors((prev) => [
          ...prev.filter((e) => e !== "allowedIPs"),
          "allowedIPs",
        ]);
      }
    }
  }, [formData.allowedIPs]);

  const validatePermissions = useCallback((): boolean => {
    if (!hasAnyPermissions(formData.permissions)) {
      setFormErrors((prev) => {
        if (!prev.includes("permissions")) {
          return [...prev, "permissions"];
        }
        return prev;
      });
      return false;
    }
    return true;
  }, [formData.permissions]);

  const getAllowedIPsError = useCallback((): string | undefined => {
    if (formErrors.includes("allowedIPs")) {
      const { error } = validateAllowedIPs(formData.allowedIPs);
      return error || "Invalid IP format";
    }
    return undefined;
  }, [formErrors, formData.allowedIPs]);

  const getPermissionsError = useCallback((): string | undefined => {
    return formErrors.includes("permissions")
      ? "At least one permission is required"
      : undefined;
  }, [formErrors]);

  const addError = useCallback((error: string) => {
    setFormErrors((prev) => {
      if (!prev.includes(error)) {
        return [...prev, error];
      }
      return prev;
    });
  }, []);

  const isFormValid = useCallback((): boolean => {
    return (
      formErrors.length === 0 &&
      hasAnyPermissions(formData.permissions) &&
      validateAllowedIPs(formData.allowedIPs).isValid
    );
  }, [formErrors.length, formData.permissions, formData.allowedIPs]);

  const resetForm = useCallback(() => {
    setFormData({
      allowedIPs: "",
      permissions: { ...INITIAL_PERMISSIONS },
    });
    setFormErrors([]);
  }, []);

  const setForm = useCallback((data: ApiKeyFormState) => {
    setFormData(data);
    setFormErrors([]);
  }, []);

  return {
    formData,
    formErrors,
    setFormData,
    handleAllowedIPsChange,
    handlePermissionChange,
    handleAllowedIPsBlur,
    validatePermissions,
    getAllowedIPsError,
    getPermissionsError,
    removeItemFromErrors,
    addError,
    isFormValid,
    resetForm,
    setForm,
  };
};
