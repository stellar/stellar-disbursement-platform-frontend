import {
  Card,
  Heading,
  Notification,
  Icon,
  Button,
} from "@stellar/design-system";
import { useEffect, useCallback, useState } from "react";
import { useDispatch } from "react-redux";

import { useRedux } from "hooks/useRedux";
import { AppDispatch } from "store";
import {
  getApiKeysAction,
  createApiKeyAction,
  clearApiKeysErrorAction,
  deleteApiKeyAction,
} from "store/ducks/apiKeys";

import { ApiKeysTable } from "components/ApiKeysTable";
import { ErrorWithExtras } from "components/ErrorWithExtras";
import { ShowForRoles } from "components/ShowForRoles";
import { ApiKeysDescription } from "components/ApiKeysDescription";
import { UserRole, CreateApiKeyRequest, ApiKey } from "types";
import {
  ApiKeySuccessModal,
  CreateApiKeyModal,
} from "components/CreateApiKeyModal";
import { DeleteApiKeyModal } from "components/DeleteApiKeyModal";

const ACCEPTED_ROLES: UserRole[] = ["owner", "developer"];

export const ApiKeys = () => {
  const { apiKeys } = useRedux("apiKeys");
  const dispatch: AppDispatch = useDispatch();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | undefined>();
  const [createdApiKey, setCreatedApiKey] = useState<
    { name: string; key: string } | undefined
  >();

  useEffect(() => {
    dispatch(getApiKeysAction());
  }, [dispatch]);

  const handleCreateApiKey = useCallback(() => {
    setIsCreateModalVisible(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalVisible(false);
  }, []);

  const handleCloseSuccessModal = useCallback(() => {
    setIsSuccessModalVisible(false);
    setCreatedApiKey(undefined);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalVisible(false);
    setSelectedApiKey(undefined);
  }, []);

  const handleResetQuery = useCallback(() => {
    dispatch(clearApiKeysErrorAction());
  }, [dispatch]);

  const handleSubmitCreateApiKey = useCallback(
    async (apiKeyData: CreateApiKeyRequest) => {
      try {
        const resultAction = await dispatch(createApiKeyAction(apiKeyData));

        if (createApiKeyAction.fulfilled.match(resultAction)) {
          const newApiKey = resultAction.payload as ApiKey;

          setIsCreateModalVisible(false);

          setCreatedApiKey({
            name: newApiKey.name,
            key: newApiKey.key || "", // The key should be present in creation response
          });
          setIsSuccessModalVisible(true);
        }
      } catch (error) {
        console.error("Error creating API key:", error);
      }
    },
    [dispatch],
  );

  const handleSubmitDeleteApiKey = useCallback(
    async (apiKeyId: string) => {
      try {
        const resultAction = await dispatch(deleteApiKeyAction(apiKeyId));

        if (deleteApiKeyAction.fulfilled.match(resultAction)) {
          setIsDeleteModalVisible(false);
          setSelectedApiKey(undefined);
        }
      } catch (error) {
        console.error("Error deleting API key:", error);
      }
    },
    [dispatch],
  );

  const handleEditKey = useCallback((keyId: string) => {
    console.log("Edit API Key:", keyId);
  }, []);

  const handleDeleteKey = useCallback(
    (keyId: string) => {
      const apiKey = apiKeys.items.find((key) => key.id === keyId);
      if (apiKey) {
        setSelectedApiKey(apiKey);
        setIsDeleteModalVisible(true);
      }
    },
    [apiKeys.items],
  );

  if (
    apiKeys.errorString &&
    !isCreateModalVisible &&
    !isSuccessModalVisible &&
    !isDeleteModalVisible
  ) {
    return (
      <ShowForRoles acceptedRoles={ACCEPTED_ROLES}>
        <Notification variant="error" title="Error">
          <ErrorWithExtras
            appError={{
              message: apiKeys.errorString,
            }}
          />
        </Notification>
      </ShowForRoles>
    );
  }

  if (
    apiKeys.status === "PENDING" &&
    apiKeys.items.length === 0 &&
    !isCreateModalVisible &&
    !isSuccessModalVisible &&
    !isDeleteModalVisible
  ) {
    return (
      <ShowForRoles acceptedRoles={ACCEPTED_ROLES}>
        <div className="Note">Loading…</div>
      </ShowForRoles>
    );
  }

  return (
    <ShowForRoles acceptedRoles={ACCEPTED_ROLES}>
      <div className="CardStack">
        <div className="CardStack__card">
          <Card>
            <div className="CardStack__title">
              <Heading as="h3" size="sm" style={{ marginBottom: "1.5rem" }}>
                API Keys
              </Heading>
              <Button
                variant="tertiary"
                size="sm"
                icon={<Icon.Add />}
                iconPosition="right"
                style={{ marginBottom: "1.5rem" }}
                onClick={handleCreateApiKey}
              >
                Create API Key
              </Button>
            </div>
            <div className="CardStack__body">
              <ApiKeysTable
                apiKeys={apiKeys.items}
                isLoading={apiKeys.status === "PENDING"}
                onEditKey={handleEditKey}
                onDeleteKey={handleDeleteKey}
              />
            </div>
          </Card>
        </div>

        <div className="CardStack__card">
          <Card>
            <div className="CardStack__title">
              <Heading as="h3" size="sm" style={{ marginBottom: "1rem" }}>
                Available API Fields
              </Heading>
            </div>
            <div className="CardStack__body">
              <ApiKeysDescription />
            </div>
          </Card>
        </div>
      </div>

      <CreateApiKeyModal
        visible={isCreateModalVisible}
        onClose={handleCloseCreateModal}
        onSubmit={handleSubmitCreateApiKey}
        onResetQuery={handleResetQuery}
        isLoading={apiKeys.status === "PENDING"}
        errorMessage={apiKeys.errorString}
      />

      <ApiKeySuccessModal
        visible={isSuccessModalVisible}
        onClose={handleCloseSuccessModal}
        apiKey={createdApiKey}
      />

      <DeleteApiKeyModal
        visible={isDeleteModalVisible}
        onClose={handleCloseDeleteModal}
        onSubmit={handleSubmitDeleteApiKey}
        onResetQuery={handleResetQuery}
        isLoading={apiKeys.status === "PENDING"}
        errorMessage={apiKeys.errorString}
        apiKey={selectedApiKey}
      />
    </ShowForRoles>
  );
};
