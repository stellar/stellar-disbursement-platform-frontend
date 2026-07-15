import React, { useState } from "react";

import {
    Button,
    Heading,
    Input,
    Modal,
    Notification,
    Select,
} from "@stellar/design-system";

import { Pagination } from "@/components/Pagination";
import { ProxiesTable } from "@/components/ProxiesTable";
import { SectionHeader } from "@/components/SectionHeader";

import { useProxies } from "@/apiQueries/useProxies";

import { number } from "@/helpers/formatIntlNumber";

const RELATIONSHIP_OPTIONS = [
    "Community Leader",
    "Village Elder",
    "Field Staff",
    "Relative",
    "Neighbor",
];

interface RegisterProxyForm {
    fullName: string;
    phoneNumber: string;
    nationalId: string;
    relationship: string;
}

const EMPTY_FORM: RegisterProxyForm = {
    fullName: "",
    phoneNumber: "",
    nationalId: "",
    relationship: RELATIONSHIP_OPTIONS[0],
};

export const Proxies = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState<RegisterProxyForm>(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const pageLimit = 20;

    const {
        data: proxies,
        error,
        isLoading,
        isFetching,
    } = useProxies({
        page: currentPage.toString(),
        page_limit: pageLimit.toString(),
    });

    const maxPages = proxies?.pagination?.pages || 1;

    // Client-side search filter on mock data
    const filteredItems = (proxies?.data || []).filter((p) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            p.fullName?.toLowerCase().includes(q) ||
            p.phoneNumber?.toLowerCase().includes(q) ||
            p.nationalId?.toLowerCase().includes(q) ||
            p.relationship?.toLowerCase().includes(q)
        );
    });

    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleOpenModal = () => {
        setForm(EMPTY_FORM);
        setSaveSuccess(false);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSave = async () => {
        // Frontend-complete: validates and "saves" (will hit POST /proxies when backend is ready)
        if (!form.fullName.trim() || !form.phoneNumber.trim() || !form.nationalId.trim()) {
            return;
        }
        setIsSaving(true);
        // Simulate network latency
        await new Promise((r) => setTimeout(r, 800));
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => {
            setIsModalOpen(false);
            setSaveSuccess(false);
        }, 1500);
    };

    const isFormValid =
        form.fullName.trim() !== "" &&
        form.phoneNumber.trim() !== "" &&
        form.nationalId.trim() !== "";

    return (
        <>
            <SectionHeader>
                <SectionHeader.Row>
                    <SectionHeader.Content>
                        <Heading as="h2" size="sm">
                            {proxies?.pagination?.total && proxies.pagination.total > 0
                                ? `${number.format(proxies.pagination.total)} `
                                : ""}
                            Proxy Agents
                        </Heading>
                    </SectionHeader.Content>

                    <SectionHeader.Content align="right">
                        <Button
                            id="register-proxy-btn"
                            variant="primary"
                            size="sm"
                            onClick={handleOpenModal}
                        >
                            + Register Proxy
                        </Button>
                    </SectionHeader.Content>
                </SectionHeader.Row>

                <SectionHeader.Row>
                    <SectionHeader.Content>
                        <Input
                            id="proxies-search"
                            fieldSize="sm"
                            placeholder="Search by name, phone, ID or relationship…"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
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
            </SectionHeader>

            <ProxiesTable
                proxiesItems={filteredItems}
                apiError={error?.message}
                isLoading={isLoading || isFetching}
            />

            {/* ── Register Proxy Modal ── */}
            <Modal visible={isModalOpen} onClose={handleCloseModal}>
                <Modal.Heading>Register Proxy Agent</Modal.Heading>

                <Modal.Body>
                    {saveSuccess && (
                        <Notification variant="success" title="Proxy registered!" isFilled>
                            The proxy agent has been successfully registered.
                        </Notification>
                    )}

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                            marginTop: "0.5rem",
                        }}
                    >
                        <Input
                            id="proxy-fullName"
                            fieldSize="md"
                            label="Full Name *"
                            placeholder="e.g. John Amoyo"
                            name="fullName"
                            value={form.fullName}
                            onChange={handleFormChange}
                        />

                        <Input
                            id="proxy-phoneNumber"
                            fieldSize="md"
                            label="Phone Number *"
                            placeholder="e.g. +254700123456"
                            name="phoneNumber"
                            value={form.phoneNumber}
                            onChange={handleFormChange}
                        />

                        <Input
                            id="proxy-nationalId"
                            fieldSize="md"
                            label="National ID *"
                            placeholder="e.g. 29384756"
                            name="nationalId"
                            value={form.nationalId}
                            onChange={handleFormChange}
                        />

                        <div>
                            <label
                                htmlFor="proxy-relationship"
                                style={{
                                    display: "block",
                                    marginBottom: "0.4rem",
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                }}
                            >
                                Relationship to Beneficiaries
                            </label>
                            <Select
                                id="proxy-relationship"
                                fieldSize="md"
                                name="relationship"
                                value={form.relationship}
                                onChange={handleFormChange}
                            >
                                {RELATIONSHIP_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="tertiary"
                        size="md"
                        onClick={handleCloseModal}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        id="save-proxy-btn"
                        variant="primary"
                        size="md"
                        onClick={handleSave}
                        isLoading={isSaving}
                        disabled={!isFormValid || isSaving || saveSuccess}
                    >
                        Register
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
