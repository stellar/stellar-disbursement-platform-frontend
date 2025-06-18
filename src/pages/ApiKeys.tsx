import {
  Card,
  Heading,
  Notification,
  Icon,
  Button,
} from "@stellar/design-system";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { useRedux } from "hooks/useRedux";
import { AppDispatch } from "store";
import { getApiKeysAction } from "store/ducks/apiKeys";

import { ApiKeysTable } from "components/ApiKeysTable";
import { ErrorWithExtras } from "components/ErrorWithExtras";
import { ShowForRoles } from "components/ShowForRoles";
import { ApiKeysDescription } from "components/ApiKeysDescription";

export const ApiKeys = () => {
  const { apiKeys } = useRedux("apiKeys");
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(getApiKeysAction());
  }, [dispatch]);

  const renderContent = () => {
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
                onClick={() => {
                  console.log("Create API Key clicked");
                }}
              >
                Create API Key
              </Button>
            </div>
            <div className="CardStack__body">
              <ApiKeysTable
                apiKeys={apiKeys.items}
                isLoading={apiKeys.status === "PENDING"}
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
    );
  };

  return (
    <ShowForRoles acceptedRoles={["owner", "developer"]}>
      {renderContent()}
    </ShowForRoles>
  );
};
