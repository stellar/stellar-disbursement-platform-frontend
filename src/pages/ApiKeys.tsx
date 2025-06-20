import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Notification } from "@stellar/design-system";

import { useRedux } from "hooks/useRedux";
import { AppDispatch } from "store";
import { getApiKeysAction } from "store/ducks/apiKeys";
import { ApiKeysTable } from "components/ApiKeysTable/ApiKeysTable";
import { ErrorWithExtras } from "components/ErrorWithExtras";
import { ShowForRoles } from "components/ShowForRoles";
import { ApiKeysDescription } from "components/ApiKeysDescription/ApiKeysDescription";

import { UserRole } from "types";

const ACCEPTED_ROLES: UserRole[] = ["owner", "developer"];

export const ApiKeys = () => {
  const { apiKeys } = useRedux("apiKeys");
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(getApiKeysAction());
  }, [dispatch]);

  const handleCreateApiKey = useCallback(() => {
    console.log("Create API Key clicked - implement modal/form");
  }, []);

  const handleEditKey = useCallback((keyId: string) => {
    console.log("Edit API Key:", keyId);
  }, []);

  const handleDeleteKey = useCallback((keyId: string) => {
    console.log("Delete API Key:", keyId);
  }, []);

  if (apiKeys.errorString) {
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

  if (apiKeys.status === "PENDING" && apiKeys.items.length === 0) {
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
    </ShowForRoles>
  );
};
