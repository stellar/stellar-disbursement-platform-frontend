import { Card, Icon } from "@stellar/design-system";
import { Table } from "components/Table";
import { formatDateTime } from "helpers/formatIntlDateTime";
import { ApiKey } from "types";
import { MoreMenuButton } from "components/MoreMenuButton";
import { DropdownMenu } from "components/DropdownMenu";

interface ApiKeysTableProps {
  apiKeys: ApiKey[];
  isLoading?: boolean;
}

export const ApiKeysTable = ({
  apiKeys,
  isLoading = false,
}: ApiKeysTableProps) => {
  if (apiKeys.length === 0 && !isLoading) {
    return (
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
  }

  return (
    <Card borderRadiusSize="md">
      <Table isLoading={isLoading}>
        <Table.Header>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell textAlign="center">Expiration</Table.HeaderCell>
          <Table.HeaderCell textAlign="center">Last Used</Table.HeaderCell>
          <Table.HeaderCell textAlign="center">Status</Table.HeaderCell>
        </Table.Header>

        <Table.Body>
          {apiKeys.map((apiKey) => (
            <Table.BodyRow key={apiKey.id}>
              <Table.BodyCell>
                <div>
                  <div style={{ fontWeight: 500 }}>{apiKey.name}</div>
                </div>
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
                {/* Temporary: Toggle replaced with status text */}
                {/* <Toggle
                                    id={`toggle-${apiKey.id}`}
                                    checked={apiKey.enabled ?? true}
                                    onChange={() => handleToggleEnabled(apiKey.id)}
                                    /> 
                                */}
                {(() => {
                  if (!apiKey.expiry_date) {
                    return (
                      <span style={{ color: "var(--color-green-60)" }}>
                        ACTIVE
                      </span>
                    );
                  }

                  const isExpired = new Date() > new Date(apiKey.expiry_date);
                  return isExpired ? (
                    <span style={{ color: "var(--color-red-60)" }}>
                      EXPIRED
                    </span>
                  ) : (
                    <span style={{ color: "var(--color-green-60)" }}>
                      ACTIVE
                    </span>
                  );
                })()}
              </Table.BodyCell>
              <Table.BodyCell allowOverflow={true}>
                <DropdownMenu triggerEl={<MoreMenuButton />}>
                  <DropdownMenu.Item onClick={() => {}}>
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
                  <DropdownMenu.Item isHighlight={true} onClick={() => {}}>
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
              </Table.BodyCell>
            </Table.BodyRow>
          ))}
        </Table.Body>
      </Table>
    </Card>
  );
};
