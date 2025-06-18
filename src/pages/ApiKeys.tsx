import {
  Card,
  Heading,
  Notification,
  Icon,
  Button,
} from "@stellar/design-system";
import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";

import { useRedux } from "hooks/useRedux";
import { AppDispatch } from "store";
import { getApiKeysAction } from "store/ducks/apiKeys";

import { ApiKeysTable } from "components/ApiKeysTable";
import { ErrorWithExtras } from "components/ErrorWithExtras";
import { ShowForRoles } from "components/ShowForRoles";
import { ApiKeysDescription } from "components/ApiKeysDescription";
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
    </ShowForRoles>
  );
};
