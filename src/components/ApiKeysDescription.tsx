import { Table } from "components/Table";
import { Card } from "@stellar/design-system";
export const ApiKeysDescription = () => {
  return (
    <Card borderRadiusSize="md">
      <Table>
        <Table.Header>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Description</Table.HeaderCell>
          <Table.HeaderCell>Example</Table.HeaderCell>
        </Table.Header>
        <Table.Body>
          {[
            {
              name: "id",
              desc: "Unique identifier of this key.",
              ex: `"94dd6584-43ae-4162-b609-8e5cca0117f1"`,
            },
            {
              name: "name",
              desc: "Human-readable name for the key.",
              ex: "Reporting Service Key",
            },
            {
              name: "key",
              desc: "API Key. Only returned during creation, then stored as hashed format.",
              ex: `"sdp_123abc..a87c9f8370a8480a3c26bb29e0f6f8b2"`,
            },
            {
              name: "expiry_date",
              desc: "Optional expiration date. Null means never expires.",
              ex: `"2025-04-25T14:55:12Z"`,
            },
            {
              name: "permissions",
              desc: "Array of read and write permissions associated with this key.",
              ex: `["read:statistics", "read:exports", "read:payments"]`,
            },
            {
              name: "allowed_ips",
              desc: "IPs and IP ranges allowed. Empty array means no restrictions.",
              ex: `["203.0.113.5", "198.51.100.0/24"]`,
            },
            {
              name: "enabled",
              desc: "Whether the API key is active and can be used for authentication.",
              ex: "true",
            },
            {
              name: "created_at",
              desc: "Timestamp when this key was created.",
              ex: `"2025-04-25T14:55:12Z"`,
            },
            {
              name: "created_by",
              desc: "ID of the User that created this API Key.",
              ex: `"6b46e82a-35d0-4ad6-bf43-d7125cf82b63"`,
            },
            {
              name: "updated_at",
              desc: "Timestamp when this key was last updated.",
              ex: `"2025-04-25T14:55:12Z"`,
            },
            {
              name: "updated_by",
              desc: "ID of the User that updated this API Key.",
              ex: `"8a9fa09c-f5ea-42da-9121-69260f0bdee1"`,
            },
            {
              name: "last_used_at",
              desc: "Timestamp when this key was last used.",
              ex: `"2025-04-25T14:55:12Z"`,
            },
          ].map(({ name, desc, ex }) => (
            <Table.BodyRow key={name}>
              <Table.BodyCell>
                <code>{name}</code>
              </Table.BodyCell>
              <Table.BodyCell>{desc}</Table.BodyCell>
              <Table.BodyCell textAlign="center">
                <code>{ex}</code>
              </Table.BodyCell>
            </Table.BodyRow>
          ))}
        </Table.Body>
      </Table>
    </Card>
  );
};
