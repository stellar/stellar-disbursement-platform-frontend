import React, { useState } from "react";

import { Heading, Input, Select } from "@stellar/design-system";

import { Pagination } from "@/components/Pagination";
import { ProxyDeliveriesTable } from "@/components/ProxyDeliveriesTable";
import { SectionHeader } from "@/components/SectionHeader";

import { useProxyDeliveries } from "@/apiQueries/useProxyDeliveries";

import { number } from "@/helpers/formatIntlNumber";

const STATUS_OPTIONS = [
    { value: "", label: "All Statuses" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "PENDING", label: "Pending" },
    { value: "FAILED", label: "Failed" },
    { value: "DISPUTED", label: "Disputed" },
];

export const ProxyDeliveries = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const pageLimit = 20;

    const {
        data: proxyDeliveries,
        error,
        isLoading,
        isFetching,
    } = useProxyDeliveries({
        page: currentPage.toString(),
        page_limit: pageLimit.toString(),
    });

    const maxPages = proxyDeliveries?.pagination?.pages || 1;

    // Client-side filter on mock data
    const filteredItems = (proxyDeliveries?.data || []).filter((d) => {
        const matchesStatus = !statusFilter || d.deliveryStatus === statusFilter;
        if (!search.trim()) return matchesStatus;
        const q = search.toLowerCase();
        const matchesSearch =
            d.proxyName?.toLowerCase().includes(q) ||
            d.receiverName?.toLowerCase().includes(q) ||
            d.id?.toLowerCase().includes(q) ||
            d.cardReference?.toLowerCase().includes(q) ||
            d.paymentId?.toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
    });

    return (
        <>
            <SectionHeader>
                <SectionHeader.Row>
                    <SectionHeader.Content>
                        <Heading as="h2" size="sm">
                            {proxyDeliveries?.pagination?.total && proxyDeliveries.pagination.total > 0
                                ? `${number.format(proxyDeliveries.pagination.total)} `
                                : ""}
                            Proxy Deliveries
                        </Heading>
                    </SectionHeader.Content>

                    <SectionHeader.Content align="right">
                        <Pagination
                            currentPage={Number(currentPage)}
                            maxPages={Number(maxPages)}
                            onSetPage={(page) => setCurrentPage(page)}
                            isLoading={isLoading || isFetching}
                        />
                    </SectionHeader.Content>
                </SectionHeader.Row>

                <SectionHeader.Row>
                    <SectionHeader.Content>
                        <Input
                            id="proxy-deliveries-search"
                            fieldSize="sm"
                            placeholder="Search by proxy, beneficiary, card ref…"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </SectionHeader.Content>

                    <SectionHeader.Content align="right">
                        <Select
                            id="proxy-deliveries-status-filter"
                            fieldSize="sm"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </Select>
                    </SectionHeader.Content>
                </SectionHeader.Row>
            </SectionHeader>

            <ProxyDeliveriesTable
                items={filteredItems}
                apiError={error?.message}
                isLoading={isLoading || isFetching}
            />
        </>
    );
};
