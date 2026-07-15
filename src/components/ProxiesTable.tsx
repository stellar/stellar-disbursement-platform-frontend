import React from "react";

import { Badge, Card, Notification } from "@stellar/design-system";

import { ErrorWithExtras } from "@/components/ErrorWithExtras";
import { Table } from "@/components/Table";

import { formatDateTime } from "@/helpers/formatIntlDateTime";

import { Proxy } from "@/types";

interface ProxiesTableProps {
    proxiesItems: Proxy[];
    apiError?: string;
    isLoading?: boolean;
}

const RELATIONSHIP_LABELS: Record<string, string> = {
    "Community Leader": "Community Leader",
    "Relative": "Relative",
    "Village Elder": "Village Elder",
    "Field Staff": "Field Staff",
    "Neighbor": "Neighbor",
};

export const ProxiesTable: React.FC<ProxiesTableProps> = ({
    proxiesItems,
    apiError,
    isLoading,
}: ProxiesTableProps) => {
    if (apiError) {
        return (
            <Notification variant="error" title="Error" isFilled={true}>
                <ErrorWithExtras
                    appError={{
                        message: apiError,
                    }}
                />
            </Notification>
        );
    }

    if (proxiesItems.length === 0) {
        if (isLoading) {
            return <div className="Note">Loading…</div>;
        }
        return (
            <div className="Note">
                No proxy agents registered yet. Use the <strong>Register Proxy</strong> button above to add one.
            </div>
        );
    }

    return (
        <div className="FiltersWithSearch">
            <Card noPadding>
                <Table isLoading={isLoading}>
                    <Table.Header>
                        <Table.HeaderCell>Full Name</Table.HeaderCell>
                        <Table.HeaderCell>Phone Number</Table.HeaderCell>
                        <Table.HeaderCell>National ID</Table.HeaderCell>
                        <Table.HeaderCell>Relationship</Table.HeaderCell>
                        <Table.HeaderCell>Assigned Receivers</Table.HeaderCell>
                        <Table.HeaderCell textAlign="right">Registered At</Table.HeaderCell>
                    </Table.Header>

                    <Table.Body>
                        {proxiesItems.map((proxy) => (
                            <Table.BodyRow key={proxy.id}>
                                <Table.BodyCell>
                                    <span style={{ fontWeight: 500 }}>{proxy.fullName || "—"}</span>
                                </Table.BodyCell>
                                <Table.BodyCell>{proxy.phoneNumber || "—"}</Table.BodyCell>
                                <Table.BodyCell>
                                    <span className="Table-v2__cell--secondary">{proxy.nationalId || "—"}</span>
                                </Table.BodyCell>
                                <Table.BodyCell>
                                    <Badge variant="secondary">{RELATIONSHIP_LABELS[proxy.relationship] ?? proxy.relationship ?? "—"}</Badge>
                                </Table.BodyCell>
                                <Table.BodyCell>
                                    <span style={{ fontWeight: 600 }}>{proxy.assignedCount ?? "—"}</span>
                                </Table.BodyCell>
                                <Table.BodyCell textAlign="right">
                                    <span className="Table-v2__cell--secondary">
                                        {proxy.createdAt ? formatDateTime(proxy.createdAt) : "—"}
                                    </span>
                                </Table.BodyCell>
                            </Table.BodyRow>
                        ))}
                    </Table.Body>
                </Table>
            </Card>
        </div>
    );
};
