import { useEffect, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { Notification } from "@stellar/design-system";

import { useRedux } from "hooks/useRedux";
import { AppDispatch } from "store";

import {
  getApiKeysAction,
  createApiKeyAction,
  deleteApiKeyAction,
  updateApiKeyAction,
  clearApiKeysErrorAction,
} from "store/ducks/apiKeys";

import { ApiKeysTable } from "components/ApiKeysTable/ApiKeysTable";
import { ErrorWithExtras } from "components/ErrorWithExtras";
import { ShowForRoles } from "components/ShowForRoles";
import { ApiKeysDescription } from "components/ApiKeysDescription/ApiKeysDescription";
import { ApiKeySuccessModal } from "components/ApiKeySuccessModal/ApiKeySuccessModal";
import { CreateApiKeyModal } from "components/ApiKeyCreateModal/ApiKeyCreateModal";
import { DeleteApiKeyModal } from "components/ApiKeyDeleteModal/DeleteApiKeyModal";
import { EditApiKeyModal } from "components/ApiKeyUpdateModal/EditApiKeyModal";

import { UserRole, CreateApiKeyRequest, ApiKey } from "types";
import { UpdateApiKeyRequest } from "api/updateApiKey";

const ACCEPTED_ROLES: UserRole[] = ["owner", "developer"];

export const ApiKeys = () => {
  const { apiKeys } = useRedux("apiKeys");
  const dispatch: AppDispatch = useDispatch();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [createdApiKey, setCreatedApiKey] = useState<
    { name: string; key: string } | undefined
  >();
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | undefined>();
  const [editingApiKey, setEditingApiKey] = useState<ApiKey | undefined>();

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

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalVisible(false);
    setEditingApiKey(undefined);
  }, []);

  const handleSubmitCreateApiKey = useCallback(
    async (apiKeyData: CreateApiKeyRequest) => {
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
    },
    [dispatch],
  );

  const deleteApiKey = useCallback(
    (apiKeyId: string) => {
      dispatch(deleteApiKeyAction(apiKeyId));
    },
    [dispatch],
  );

  const handleSubmitEditApiKey = useCallback(
    async (apiKeyId: string, updateData: UpdateApiKeyRequest) => {
      await dispatch(updateApiKeyAction({ apiKeyId, updateData }));
      setIsEditModalVisible(false);
      setEditingApiKey(undefined);
    },
    [dispatch],
  );

  const handleResetQuery = useCallback(() => {
    dispatch(clearApiKeysErrorAction());
  }, [dispatch]);

  const handleEditKey = useCallback(
    (keyId: string) => {
      const apiKey = apiKeys.items.find((key) => key.id === keyId);
      if (apiKey) {
        setEditingApiKey(apiKey);
        setIsEditModalVisible(true);
      }
    },
    [apiKeys.items],
  );
  useEffect(() => {
    if (apiKeys.status === "SUCCESS") {
      setIsDeleteModalVisible(false);
      setSelectedApiKey(undefined);
    }
  }, [apiKeys.status]);

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

  const renderPageContent = () => {
    if (apiKeys.errorString) {
      return (
        <Notification variant="error" title="Error">
          <ErrorWithExtras
            appError={{
              message: apiKeys.errorString,
            }}
          />
        </Notification>
      );
    }

    if (apiKeys.status === "PENDING" && apiKeys.items.length === 0) {
      return <div className="Note">Loading…</div>;
    }

    return (
      <div className="CardStack">
        <div className="CardStack__card">
          <ApiKeysTable
            apiKeys={apiKeys.items}
            isLoading={apiKeys.status === "PENDING"}
            onCreateKey={handleCreateApiKey}
            onEditKey={handleEditKey}
            onDeleteKey={handleDeleteKey}
          />
        </div>

        <div className="CardStack__card">
          <ApiKeysDescription />
        </div>
      </div>
    );
  };

  return (
    <>
      <ShowForRoles acceptedRoles={ACCEPTED_ROLES}>
        {renderPageContent()}
      </ShowForRoles>

      {/* Modals - rendered once outside of conditional logic */}
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
        onSubmit={deleteApiKey}
        onResetQuery={handleResetQuery}
        isLoading={apiKeys.status === "PENDING"}
        errorMessage={apiKeys.errorString}
        apiKey={selectedApiKey}
      />

      <EditApiKeyModal
        visible={isEditModalVisible}
        onClose={handleCloseEditModal}
        onSubmit={handleSubmitEditApiKey}
        onResetQuery={handleResetQuery}
        isLoading={apiKeys.status === "PENDING"}
        errorMessage={apiKeys.errorString}
        apiKey={editingApiKey}
      />
    </>
  );
};
