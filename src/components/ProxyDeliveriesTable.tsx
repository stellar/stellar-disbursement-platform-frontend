import React from "react";

import { Badge, Card, Notification } from "@stellar/design-system";

import { ErrorWithExtras } from "@/components/ErrorWithExtras";
import { Table } from "@/components/Table";

import { formatDateTime } from "@/helpers/formatIntlDateTime";

import { ProxyDelivery } from "@/types";

interface ProxyDeliveriesTableProps {
    items: ProxyDelivery[];
    apiError?: string;
    isLoading?: boolean;
}

type BadgeVariant = "default" | "success" | "error" | "warning" | "secondary" | "pending" | "highlight";

const STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
    DELIVERED: { label: "Delivered", variant: "success" },
    PENDING: { label: "Pending", variant: "pending" },
    FAILED: { label: "Failed", variant: "error" },
    DISPUTED: { label: "Disputed", variant: "warning" },
};

export const ProxyDeliveriesTable: React.FC<ProxyDeliveriesTableProps> = ({
    items,
    apiError,
    isLoading,
}: ProxyDeliveriesTableProps) => {
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

    if (items.length === 0) {
        if (isLoading) {
            return <div className="Note">Loading…</div>;
        }
        return (
            <div className="Note">
                No proxy delivery events recorded yet. Deliveries appear here once a proxy agent scans a beneficiary card.
            </div>
        );
    }

    return (
        <div className="FiltersWithSearch">
            <Card noPadding>
                <Table isLoading={isLoading}>
                    <Table.Header>
                        <Table.HeaderCell>Delivery ID</Table.HeaderCell>
                        <Table.HeaderCell>Proxy Agent</Table.HeaderCell>
                        <Table.HeaderCell>Beneficiary</Table.HeaderCell>
                        <Table.HeaderCell>Payment ID</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Card Scanned</Table.HeaderCell>
                        <Table.HeaderCell textAlign="right">Scan Time</Table.HeaderCell>
                    </Table.Header>

                    <Table.Body>
                        {items.map((item) => {
                            const statusCfg = STATUS_CONFIG[item.deliveryStatus] ?? {
                                label: item.deliveryStatus,
                                variant: "secondary" as BadgeVariant,
                            };
                            return (
                                <Table.BodyRow key={item.id}>
                                    <Table.BodyCell>
                                        <span className="Table-v2__cell--secondary" title={item.id}>
                                            {item.id.length > 12 ? `${item.id.slice(0, 12)}…` : item.id}
                                        </span>
                                    </Table.BodyCell>
                                    <Table.BodyCell>
                                        <span style={{ fontWeight: 500 }}>{item.proxyName || "—"}</span>
                                    </Table.BodyCell>
                                    <Table.BodyCell>{item.receiverName || "—"}</Table.BodyCell>
                                    <Table.BodyCell>
                                        <span className="Table-v2__cell--secondary" title={item.paymentId}>
                                            {item.paymentId ? (item.paymentId.length > 10 ? `${item.paymentId.slice(0, 10)}…` : item.paymentId) : "—"}
                                        </span>
                                    </Table.BodyCell>
                                    <Table.BodyCell>
                                        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                                    </Table.BodyCell>
                                    <Table.BodyCell>
                                        {item.cardReference ? (
                                            <span style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                                                {item.cardReference}
                                            </span>
                                        ) : (
                                            <span className="Table-v2__cell--secondary">—</span>
                                        )}
                                    </Table.BodyCell>
                                    <Table.BodyCell textAlign="right">
                                        <span className="Table-v2__cell--secondary">
                                            {item.scanTime ? formatDateTime(item.scanTime) : "—"}
                                        </span>
                                    </Table.BodyCell>
                                </Table.BodyRow>
                            );
                        })}
                    </Table.Body>
                </Table>
            </Card>
        </div>
    );
};
