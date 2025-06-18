import { Card, Icon } from "@stellar/design-system";
import { Table } from "components/Table";
import { formatDateTime } from "helpers/formatIntlDateTime";
import { ApiKey } from "types";
import { MoreMenuButton } from "components/MoreMenuButton";
import { DropdownMenu } from "components/DropdownMenu";

interface ApiKeysTableProps {
  apiKeys: ApiKey[];
  isLoading?: boolean;
  onEditKey?: (keyId: string) => void;
  onDeleteKey?: (keyId: string) => void;
}

type ApiKeyStatus = "ACTIVE" | "EXPIRED";

interface StatusConfig {
  label: string;
  color: string;
}

const STATUS_STYLES: Record<ApiKeyStatus, StatusConfig> = {
  ACTIVE: {
    label: "ACTIVE",
    color: "var(--color-green-60)",
  },
  EXPIRED: {
    label: "EXPIRED",
    color: "var(--color-red-60)",
  },
} as const;

// Helper function to determine API key status
const getApiKeyStatus = (apiKey: ApiKey): ApiKeyStatus => {
  if (!apiKey.expiry_date) {
    return "ACTIVE";
  }

  const isExpired = new Date() > new Date(apiKey.expiry_date);
  return isExpired ? "EXPIRED" : "ACTIVE";
};

const EmptyState = () => (
  <Card variant="secondary">
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "48px 24px",
        textAlign: "center",
        gap: "8px",
      }}
    >
      <div className="Note">
        <Icon.Key />
        You have no keys. Create one to get started.
      </div>
    </div>
  </Card>
);

const StatusCell = ({ apiKey }: { apiKey: ApiKey }) => {
  const status = getApiKeyStatus(apiKey);
  const statusConfig = STATUS_STYLES[status];

  return (
    <span style={{ color: statusConfig.color }}>{statusConfig.label}</span>
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Edit key
          <Icon.Edit />
        </div>
      </DropdownMenu.Item>
      <DropdownMenu.Item isHighlight={true} onClick={handleDelete}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
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
  onEditKey,
  onDeleteKey,
}: ApiKeysTableProps) => {
  if (apiKeys.length === 0 && !isLoading) {
    return <EmptyState />;
  }

  return (
    <Card borderRadiusSize="md">
      <Table isLoading={isLoading}>
        <Table.Header>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell textAlign="center">Expiration</Table.HeaderCell>
          <Table.HeaderCell textAlign="center">Last Used</Table.HeaderCell>
          <Table.HeaderCell textAlign="center">Status</Table.HeaderCell>
          <Table.HeaderCell>Actions</Table.HeaderCell>
        </Table.Header>

        <Table.Body>
          {apiKeys.map((apiKey) => (
            <Table.BodyRow key={apiKey.id}>
              <Table.BodyCell>
                <div style={{ fontWeight: 500 }}>{apiKey.name}</div>
              </Table.BodyCell>

              <Table.BodyCell>
                <span className="Table-v2__cell--secondary">
                  {apiKey.expiry_date
                    ? formatDateTime(apiKey.expiry_date)
                    : "-"}
                </span>
              </Table.BodyCell>

              <Table.BodyCell>
                <span className="Table-v2__cell--secondary">
                  {apiKey.last_used_at
                    ? formatDateTime(apiKey.last_used_at)
                    : "-"}
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
  );
};
