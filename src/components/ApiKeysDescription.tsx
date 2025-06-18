import { Table } from "components/Table";
import { Card } from "@stellar/design-system";
import { API_KEY_FIELD_DESCRIPTIONS } from "constants/apiKeyDescriptionFields";

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
          {API_KEY_FIELD_DESCRIPTIONS.map(({ name, description, example }) => (
            <Table.BodyRow key={name}>
              <Table.BodyCell>
                <code>{name}</code>
              </Table.BodyCell>
              <Table.BodyCell>{description}</Table.BodyCell>
              <Table.BodyCell textAlign="center">
                <code>{example}</code>
              </Table.BodyCell>
            </Table.BodyRow>
          ))}
        </Table.Body>
      </Table>
    </Card>
  );
};
