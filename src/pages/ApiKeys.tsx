import { useEffect, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { Notification } from "@stellar/design-system";

import { useRedux } from "hooks/useRedux";
import { AppDispatch } from "store";
import {
  getApiKeysAction,
  createApiKeyAction,
  clearApiKeysErrorAction,
} from "store/ducks/apiKeys";
import { ApiKeysTable } from "components/ApiKeysTable/ApiKeysTable";
import { ErrorWithExtras } from "components/ErrorWithExtras";
import { ShowForRoles } from "components/ShowForRoles";
import { ApiKeysDescription } from "components/ApiKeysDescription/ApiKeysDescription";
import { UserRole, CreateApiKeyRequest, ApiKey } from "types";
import { CreateApiKeyModal } from "components/ApiKeyCreateModal/ApiKeyCreateModal";
import { ApiKeySuccessModal } from "components/ApiKeySuccessModal/ApiKeySuccessModal";

const ACCEPTED_ROLES: UserRole[] = ["owner", "developer"];

export const ApiKeys = () => {
  const { apiKeys } = useRedux("apiKeys");
  const dispatch: AppDispatch = useDispatch();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
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

  const handleEditKey = useCallback((keyId: string) => {
    console.log("Edit API Key:", keyId);
  }, []);

  const handleDeleteKey = useCallback((keyId: string) => {
    console.log("Delete API Key:", keyId);
  }, []);

  if (apiKeys.errorString && !isCreateModalVisible && !isSuccessModalVisible) {
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
    !isSuccessModalVisible
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
    </ShowForRoles>
  );
};
