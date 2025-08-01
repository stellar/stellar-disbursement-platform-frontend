import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Heading, Icon, Notification } from "@stellar/design-system";
import { useDispatch } from "react-redux";

import { getApiKey } from "api/getApiKey";
import { UpdateApiKeyRequest } from "api/updateApiKey";
import { Breadcrumbs } from "components/Breadcrumbs";
import { SectionHeader } from "components/SectionHeader";
import { CopyWithIcon } from "components/CopyWithIcon";
import { ErrorWithExtras } from "components/ErrorWithExtras";
import { ShowForRoles } from "components/ShowForRoles";
import { EditApiKeyModal } from "components/ApiKeyUpdateModal/EditApiKeyModal";
import { DeleteApiKeyModal } from "components/ApiKeyDeleteModal/DeleteApiKeyModal";
import { ValuesList } from "components/ValueList/ValueList";
import { API_KEY_PERMISSION_RESOURCES } from "constants/apiKeyPermissions";
import { Routes } from "constants/settings";
import { formatDateTime } from "helpers/formatIntlDateTime";
import { useRedux } from "hooks/useRedux";
import { AppDispatch } from "store";
import {
  deleteApiKeyAction,
  updateApiKeyAction,
  clearApiKeysErrorAction,
} from "store/ducks/apiKeys";
import { ApiKey, UserRole } from "types";

import "./styles.scss";

const ACCEPTED_ROLES: UserRole[] = ["owner", "developer"];

export const ApiKeyDetails = () => {
  const { id: apiKeyId } = useParams();
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { apiKeys, userAccount } = useRedux("apiKeys", "userAccount");

  const [apiKey, setApiKey] = useState<ApiKey | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  useEffect(() => {
    const fetchApiKey = async () => {
      if (!apiKeyId || !userAccount.token) return;

      setIsLoading(true);
      setError(undefined);

      try {
        const keyData = await getApiKey(userAccount.token, apiKeyId);
        setApiKey(keyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch API key details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiKey();
  }, [apiKeyId, userAccount.token]);

  useEffect(() => {
    if (apiKey && apiKeys.items.length > 0) {
      const updatedKey = apiKeys.items.find((key) => key.id === apiKey.id);
      if (updatedKey) {
        setApiKey(updatedKey);
      }
    }
  }, [apiKeys.items, apiKey]);

  useEffect(() => {
    if (apiKeys.status === "SUCCESS" && apiKeys.items.length >= 0) {
      const keyExists = apiKeys.items.some((key) => key.id === apiKeyId);
      if (!keyExists && apiKeyId) {
        navigate(Routes.API_KEYS);
      }
    }
  }, [apiKeys.status, apiKeys.items, apiKeyId, navigate]);

  const handleEditKey = () => setIsEditModalVisible(true);
  const handleDeleteKey = () => setIsDeleteModalVisible(true);
  const handleCloseEditModal = () => setIsEditModalVisible(false);
  const handleCloseDeleteModal = () => setIsDeleteModalVisible(false);

  const handleSubmitEditApiKey = useCallback(
    async (apiKeyId: string, updateData: UpdateApiKeyRequest) => {
      await dispatch(updateApiKeyAction({ apiKeyId, updateData }));
      setIsEditModalVisible(false);
      // Refresh the API key data
      if (userAccount.token) {
        const updatedKey = await getApiKey(userAccount.token, apiKeyId);
        setApiKey(updatedKey);
      }
    },
    [dispatch, userAccount.token],
  );

  const handleDeleteApiKey = useCallback(
    (apiKeyId: string) => {
      dispatch(deleteApiKeyAction(apiKeyId));
    },
    [dispatch],
  );

  const handleResetQuery = useCallback(() => {
    dispatch(clearApiKeysErrorAction());
  }, [dispatch]);

  const getApiKeyStatus = () => {
    if (!apiKey) return "UNKNOWN";

    if (!apiKey.expiry_date) {
      return "ACTIVE";
    }

    const isExpired = new Date() > new Date(apiKey.expiry_date);
    return isExpired ? "EXPIRED" : "ACTIVE";
  };

  const formatPermissions = (permissions: string[]): string[] => {
    const formattedPerms: string[] = [];

    if (permissions.includes("read:all") && permissions.includes("write:all")) {
      return ["All (Read & Write)"];
    }

    const permissionMap: Record<string, { read: boolean; write: boolean }> = {};

    permissions.forEach((perm) => {
      const [action, resource] = perm.split(":");
      if (!permissionMap[resource]) {
        permissionMap[resource] = { read: false, write: false };
      }
      if (action === "read") {
        permissionMap[resource].read = true;
      } else if (action === "write") {
        permissionMap[resource].write = true;
      }
    });

    Object.entries(permissionMap).forEach(([resource, perms]) => {
      const resourceInfo = API_KEY_PERMISSION_RESOURCES.find((r) => r.key === resource);
      const label = resourceInfo?.label || resource;

      if (perms.read && perms.write) {
        formattedPerms.push(`${label} (Read & Write)`);
      } else if (perms.read) {
        formattedPerms.push(`${label} (Read)`);
      }
    });

    return formattedPerms;
  };

  const renderContent = () => {
    if (error) {
      return (
        <Notification variant="error" title="Error">
          <ErrorWithExtras appError={{ message: error }} />
        </Notification>
      );
    }

    if (isLoading) {
      return <div className="Note">Loading…</div>;
    }

    if (!apiKey) {
      return <div className="Note">API key not found</div>;
    }

    const status = getApiKeyStatus();

    return (
      <>
        <SectionHeader>
          <SectionHeader.Row>
            <SectionHeader.Content>
              <Heading as="h2" size="xs">
                <CopyWithIcon textToCopy={apiKey.name} iconSizeRem="1.5">
                  {apiKey.name}
                </CopyWithIcon>
              </Heading>
            </SectionHeader.Content>

            <SectionHeader.Content align="right">
              <Button variant="tertiary" size="sm" icon={<Icon.Edit01 />} onClick={handleEditKey}>
                Update
              </Button>
              <Button variant="error" size="sm" icon={<Icon.Delete />} onClick={handleDeleteKey}>
                Delete
              </Button>
            </SectionHeader.Content>
          </SectionHeader.Row>
        </SectionHeader>

        <Card>
          <div
            className="StatCards__card StatCards__card--grid StatCards__card--wideGap"
            style={{ "--StatCard-grid-columns": 3 } as React.CSSProperties}
          >
            <div className="StatCards__card__column">
              <div className="StatCards__card__item">
                <label className="StatCards__card__item__label">Status</label>
                <div
                  className={`StatCards__card__item__value ApiKeyDetails__status ApiKeyDetails__status--${status.toLowerCase()}`}
                >
                  {status}
                </div>
              </div>
            </div>
            <div className="StatCards__card__column">
              <div className="StatCards__card__item">
                <label className="StatCards__card__item__label">API Key ID</label>
                <div className="StatCards__card__item__value">
                  <CopyWithIcon textToCopy={apiKey.id} iconSizeRem="0.875">
                    {apiKey.id}
                  </CopyWithIcon>
                </div>
              </div>
              <div className="StatCards__card__item">
                <label className="StatCards__card__item__label">Created by</label>
                <div className="StatCards__card__item__value">{apiKey.created_by || "-"}</div>
              </div>
              <div className="StatCards__card__item">
                <label className="StatCards__card__item__label">Created at</label>
                <div className="StatCards__card__item__value">
                  {formatDateTime(apiKey.created_at)}
                </div>
              </div>
            </div>
            <div className="StatCards__card__column">
              <div className="StatCards__card__item">
                <label className="StatCards__card__item__label">Expiration date</label>
                <div className="StatCards__card__item__value">
                  {apiKey.expiry_date ? formatDateTime(apiKey.expiry_date) : "No expiration"}
                </div>
              </div>
              <div className="StatCards__card__item">
                <label className="StatCards__card__item__label">Updated at</label>
                <div className="StatCards__card__item__value">
                  {formatDateTime(apiKey.updated_at)}
                </div>
              </div>
              <div className="StatCards__card__item">
                <label className="StatCards__card__item__label">Last used</label>
                <div className="StatCards__card__item__value">
                  {apiKey.last_used_at ? formatDateTime(apiKey.last_used_at) : "Never"}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="DetailsSection DetailsSection">
          <SectionHeader>
            <SectionHeader.Row>
              <SectionHeader.Content>
                <Heading as="h4" size="xs">
                  Permissions
                </Heading>
              </SectionHeader.Content>
            </SectionHeader.Row>
          </SectionHeader>
          <Card noPadding>
            <div className="StatCards__card">
              <div className="ApiKeyDetails__permissions">
                <ValuesList
                  values={formatPermissions(apiKey.permissions)}
                  emptyMessage="No permissions assigned"
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="DetailsSection DetailsSection">
          <SectionHeader>
            <SectionHeader.Row>
              <SectionHeader.Content>
                <Heading as="h4" size="xs">
                  IP Restrictions
                </Heading>
              </SectionHeader.Content>
            </SectionHeader.Row>
          </SectionHeader>
          <Card noPadding>
            <div className="StatCards__card">
              <div className="ApiKeyDetails__ipRestrictions">
                <ValuesList
                  values={apiKey.allowed_ips}
                  emptyMessage="No IP restrictions (accessible from any IP)"
                  isMonospace={true}
                />
              </div>
            </div>
          </Card>
        </div>
      </>
    );
  };

  return (
    <>
      <ShowForRoles acceptedRoles={ACCEPTED_ROLES}>
        <Breadcrumbs
          steps={[
            {
              label: "API Keys",
              route: Routes.API_KEYS,
            },
            {
              label: "API Key Details",
            },
          ]}
        />

        {renderContent()}
      </ShowForRoles>

      <EditApiKeyModal
        visible={isEditModalVisible}
        onClose={handleCloseEditModal}
        onSubmit={handleSubmitEditApiKey}
        onResetQuery={handleResetQuery}
        isLoading={apiKeys.status === "PENDING"}
        errorMessage={apiKeys.errorString}
        apiKey={apiKey}
      />

      <DeleteApiKeyModal
        visible={isDeleteModalVisible}
        onClose={handleCloseDeleteModal}
        onSubmit={handleDeleteApiKey}
        onResetQuery={handleResetQuery}
        isLoading={apiKeys.status === "PENDING"}
        errorMessage={apiKeys.errorString}
        apiKey={apiKey}
      />
    </>
  );
};
