import { useEffect, useMemo } from "react";

import { Button, Input, Modal, Notification } from "@stellar/design-system";

import {
  ApiKeyFormFields,
  convertToApiPermissions,
  parseExistingPermissions,
} from "@/components/ApiKeyFormFields/ApiKeyFormFields";
import { ErrorWithExtras } from "@/components/ErrorWithExtras";

import { UpdateApiKeyRequest } from "@/api/updateApiKey";

import { useDistributionWallets } from "@/apiQueries/useDistributionWallets";

import { formatDateTime } from "@/helpers/formatIntlDateTime";
import { parseAllowedIPs } from "@/helpers/parseIPs";

import { useApiKeyForm } from "@/hooks/useApiKeyForm";
import { usePrevious } from "@/hooks/usePrevious";

import { ApiKey, AppError } from "@/types";

import "./styles.scss";

interface EditApiKeyModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (apiKeyId: string, updateData: UpdateApiKeyRequest) => void;
  onResetQuery: () => void;
  isLoading: boolean;
  appError?: AppError;
  apiKey?: ApiKey;
}

export const EditApiKeyModal: React.FC<EditApiKeyModalProps> = ({
  visible,
  onClose,
  onSubmit,
  onResetQuery,
  isLoading,
  appError,
  apiKey,
}) => {
  const {
    formData,
    handleAllowedIPsChange,
    handlePermissionChange,
    handleAllowedIPsBlur,
    handleWalletToggle,
    validatePermissions,
    getAllowedIPsError,
    getPermissionsError,
    isFormValid,
    resetForm,
    setForm,
  } = useApiKeyForm({ onResetQuery, appError });

  const { data: allWallets } = useDistributionWallets(visible, true);

  // An account archived after this key was scoped to it stays offerable, checked, so saving an
  // unrelated change doesn't silently drop it. Archived accounts the key doesn't hold are omitted:
  // the API refuses to add them.
  const selectableWallets = useMemo(() => {
    const held = apiKey?.distribution_wallet_ids ?? [];
    return (allWallets ?? []).filter(
      (wallet) => wallet.status === "ACTIVE" || held.includes(wallet.id),
    );
  }, [allWallets, apiKey]);

  const previousVisible = usePrevious(visible);

  useEffect(() => {
    if (visible && apiKey) {
      const allowedIpsString = Array.isArray(apiKey.allowed_ips)
        ? apiKey.allowed_ips.join("\n")
        : apiKey.allowed_ips || "";

      const permissions = parseExistingPermissions(apiKey.permissions || []);

      setForm({
        allowedIPs: allowedIpsString,
        permissions,
        distributionWalletIds: apiKey.distribution_wallet_ids ?? [],
      });
    } else if (previousVisible && !visible) {
      resetForm();
    }
  }, [visible, apiKey, previousVisible, setForm, resetForm]);

  const handleClose = () => {
    onClose();
  };

  const canSubmit = isFormValid();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!validatePermissions()) {
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
      distribution_wallet_ids: formData.distributionWalletIds,
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
        <div className="EditApiKeyModal__content">
          <Modal.Body>
            <div className="EditApiKeyModal__description">
              Update the permissions and IP restrictions for this API key.
            </div>
            {appError && (
              <Notification variant="error" title="Error" isFilled={true}>
                <ErrorWithExtras appError={appError} />
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
                value={apiKey.expiry_date ? formatDateTime(apiKey.expiry_date) : "No expiration"}
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
                permissionsError={getPermissionsError()}
                distributionWallets={selectableWallets}
                selectedWalletIds={formData.distributionWalletIds}
                onWalletToggle={handleWalletToggle}
              />
            </div>
          </Modal.Body>
        </div>
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
            Update key
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};
