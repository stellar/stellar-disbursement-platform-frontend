import { useNavigate } from "react-router-dom";
import { Card, Icon, Heading, Button, Link } from "@stellar/design-system";

import { formatDateTime } from "helpers/formatIntlDateTime";
import { Table } from "components/Table";
import { MoreMenuButton } from "components/MoreMenuButton";
import { DropdownMenu } from "components/DropdownMenu";
import { EmptyStateMessage } from "components/EmptyStateMessage/EmptyStateMessage";
import { Routes } from "constants/settings";

import { ApiKey } from "types";

import "./styles.scss";

interface ApiKeysTableProps {
  apiKeys: ApiKey[];
  isLoading?: boolean;
  onCreateKey?: () => void;
  onEditKey?: (keyId: string) => void;
  onDeleteKey?: (keyId: string) => void;
}

type ApiKeyStatus = "ACTIVE" | "EXPIRED";

const getApiKeyStatus = (apiKey: ApiKey): ApiKeyStatus => {
  if (!apiKey.expiry_date) {
    return "ACTIVE";
  }

  const isExpired = new Date() > new Date(apiKey.expiry_date);
  return isExpired ? "EXPIRED" : "ACTIVE";
};

const EmptyState = () => (
  <Card variant="secondary">
    <div className="ApiKeysTable__emptyState">
      <EmptyStateMessage
        icon={<Icon.Key01 />}
        message="You have no keys. Create one to get started."
      />
    </div>
  </Card>
);

const StatusCell = ({ apiKey }: { apiKey: ApiKey }) => {
  const status = getApiKeyStatus(apiKey);

  return (
    <div className="StatusCell" data-status={status.toLowerCase()}>
      {status}
    </div>
  );
};

interface ActionsCellProps {
  apiKey: ApiKey;
  onEditKey?: (keyId: string) => void;
  onDeleteKey?: (keyId: string) => void;
}

const ActionsCell = ({ apiKey, onEditKey, onDeleteKey }: ActionsCellProps) => {
  const handleEdit = () => {
    onEditKey?.(apiKey.id);
  };

  const handleDelete = () => {
    onDeleteKey?.(apiKey.id);
  };

  return (
    <DropdownMenu triggerEl={<MoreMenuButton />}>
      <DropdownMenu.Item onClick={handleEdit}>
        <div className="ApiKeysTable__actionItem">
          Edit key
          <Icon.Edit01 />
        </div>
      </DropdownMenu.Item>
      <DropdownMenu.Item isHighlight={true} onClick={handleDelete}>
        <div className="ApiKeysTable__actionItem">
          Delete key
          <Icon.Delete />
        </div>
      </DropdownMenu.Item>
    </DropdownMenu>
  );
};

export const ApiKeysTable = ({
  apiKeys,
  isLoading = false,
  onCreateKey,
  onEditKey,
  onDeleteKey,
}: ApiKeysTableProps) => {
  const navigate = useNavigate();

  const handleApiKeyClicked = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    apiKeyId: string,
  ) => {
    event.preventDefault();
    navigate(`${Routes.API_KEYS}/${apiKeyId}`);
  };

  return (
    <Card>
      <div className="ApiKeysTable__header">
        <Heading as="h3" size="sm">
          API Keys
        </Heading>
        <Button
          variant="secondary"
          size="sm"
          icon={<Icon.Plus />}
          iconPosition="right"
          onClick={onCreateKey}
        >
          Create API Key
        </Button>
      </div>
      <div className="ApiKeysTable__content">
        {apiKeys.length === 0 && !isLoading ? (
          <EmptyState />
        ) : (
          <Card borderRadiusSize="md" noPadding>
            <Table isLoading={isLoading}>
              <Table.Header>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell textAlign="center">Expiration</Table.HeaderCell>
                <Table.HeaderCell textAlign="center">Last Used</Table.HeaderCell>
                <Table.HeaderCell textAlign="center">Status</Table.HeaderCell>
                <Table.HeaderCell textAlign="right" width="1.5rem">
                  Actions
                </Table.HeaderCell>
              </Table.Header>

              <Table.Body>
                {apiKeys.map((apiKey) => (
                  <Table.BodyRow key={apiKey.id}>
                    <Table.BodyCell>
                      <Link onClick={(event) => handleApiKeyClicked(event, apiKey.id)}>
                        <div className="ApiKeysTable__keyName">{apiKey.name}</div>
                      </Link>
                    </Table.BodyCell>

                    <Table.BodyCell>
                      <span className="Table-v2__cell--secondary">
                        {apiKey.expiry_date ? formatDateTime(apiKey.expiry_date) : "-"}
                      </span>
                    </Table.BodyCell>

                    <Table.BodyCell>
                      <span className="Table-v2__cell--secondary">
                        {apiKey.last_used_at ? formatDateTime(apiKey.last_used_at) : "-"}
                      </span>
                    </Table.BodyCell>

                    <Table.BodyCell textAlign="center">
                      <StatusCell apiKey={apiKey} />
                    </Table.BodyCell>

                    <Table.BodyCell allowOverflow={true}>
                      <ActionsCell
                        apiKey={apiKey}
                        onEditKey={onEditKey}
                        onDeleteKey={onDeleteKey}
                      />
                    </Table.BodyCell>
                  </Table.BodyRow>
                ))}
              </Table.Body>
            </Table>
          </Card>
        )}
      </div>
    </Card>
  );
};
