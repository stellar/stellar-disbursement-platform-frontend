import { useQuery } from "@tanstack/react-query";

// TODO: uncomment when backend is ready
// import { handleSearchParams } from "@/api/handleSearchParams";
// import { API_URL } from "@/constants/envVariables";
// import { fetchApi } from "@/helpers/fetchApi";
import { ApiProxyDeliveries, AppError, CommonFilters, PaginationParams, SortParams } from "@/types";

export type ProxyDeliveriesSearchParams = CommonFilters & SortParams & PaginationParams;

export const useProxyDeliveries = (searchParams?: ProxyDeliveriesSearchParams) => {
    // TODO: uncomment when backend is ready
    // const params = handleSearchParams(searchParams);

    const query = useQuery<ApiProxyDeliveries, AppError>({
        queryKey: ["proxy-deliveries", { ...searchParams }],
        queryFn: async () => {
            // TODO: remove mock block and uncomment below when backend is ready
            // return await fetchApi(`${API_URL}/proxy-deliveries/${params}`);

            return {
                data: [
                    {
                        id: "pdel-001",
                        proxyId: "proxy-001",
                        proxyName: "John Amoyo",
                        receiverId: "rcv-100",
                        receiverName: "Akiru Lokai",
                        paymentId: "pay-9001",
                        deliveryStatus: "DELIVERED",
                        cardReference: "SAPC-TRK-0081",
                        scanTime: new Date("2026-07-01T08:42:00Z").toISOString(),
                        createdAt: new Date("2026-07-01T08:42:00Z").toISOString(),
                    },
                    {
                        id: "pdel-002",
                        proxyId: "proxy-003",
                        proxyName: "Peter Lokoyen",
                        receiverId: "rcv-101",
                        receiverName: "Napit Ekiru",
                        paymentId: "pay-9002",
                        deliveryStatus: "DELIVERED",
                        cardReference: "SAPC-TRK-0044",
                        scanTime: new Date("2026-07-01T09:15:00Z").toISOString(),
                        createdAt: new Date("2026-07-01T09:15:00Z").toISOString(),
                    },
                    {
                        id: "pdel-003",
                        proxyId: "proxy-002",
                        proxyName: "Grace Nakiru",
                        receiverId: "rcv-102",
                        receiverName: "Dorcas Auma",
                        paymentId: "pay-9003",
                        deliveryStatus: "PENDING",
                        cardReference: "SAPC-TRK-0112",
                        scanTime: new Date("2026-07-02T10:00:00Z").toISOString(),
                        createdAt: new Date("2026-07-02T10:00:00Z").toISOString(),
                    },
                    {
                        id: "pdel-004",
                        proxyId: "proxy-001",
                        proxyName: "John Amoyo",
                        receiverId: "rcv-103",
                        receiverName: "Esekon Lopuu",
                        paymentId: "pay-9004",
                        deliveryStatus: "DISPUTED",
                        cardReference: "SAPC-TRK-0073",
                        scanTime: new Date("2026-07-03T14:30:00Z").toISOString(),
                        createdAt: new Date("2026-07-03T14:30:00Z").toISOString(),
                    },
                    {
                        id: "pdel-005",
                        proxyId: "proxy-005",
                        proxyName: "Samuel Ekai",
                        receiverId: "rcv-104",
                        receiverName: "Halima Wako",
                        paymentId: "pay-9005",
                        deliveryStatus: "FAILED",
                        cardReference: "SAPC-TRK-0095",
                        scanTime: new Date("2026-07-04T11:20:00Z").toISOString(),
                        createdAt: new Date("2026-07-04T11:20:00Z").toISOString(),
                    },
                    {
                        id: "pdel-006",
                        proxyId: "proxy-003",
                        proxyName: "Peter Lokoyen",
                        receiverId: "rcv-105",
                        receiverName: "Tioko Abule",
                        paymentId: "pay-9006",
                        deliveryStatus: "DELIVERED",
                        cardReference: "SAPC-TRK-0060",
                        scanTime: new Date("2026-07-05T08:00:00Z").toISOString(),
                        createdAt: new Date("2026-07-05T08:00:00Z").toISOString(),
                    },
                ],
                pagination: { pages: 1, total: 6 },
            };
        },
        placeholderData: (prev) => prev,
    });

    return query;
};
