import { useQuery } from "@tanstack/react-query";

// TODO: uncomment when backend is ready
// import { handleSearchParams } from "@/api/handleSearchParams";
// import { API_URL } from "@/constants/envVariables";
// import { fetchApi } from "@/helpers/fetchApi";
import { ApiProxies, AppError, CommonFilters, PaginationParams, SortParams } from "@/types";

export type ProxiesSearchParams = CommonFilters & SortParams & PaginationParams;

export const useProxies = (searchParams?: ProxiesSearchParams) => {
    // TODO: uncomment when backend is ready
    // const params = handleSearchParams(searchParams);

    const query = useQuery<ApiProxies, AppError>({
        queryKey: ["proxies", { ...searchParams }],
        queryFn: async () => {
            // TODO: remove mock block and uncomment below when backend is ready
            // return await fetchApi(`${API_URL}/proxies/${params}`);

            return {
                data: [
                    {
                        id: "proxy-001",
                        fullName: "John Amoyo",
                        phoneNumber: "+254700112233",
                        nationalId: "29384756",
                        relationship: "Community Leader",
                        assignedCount: 14,
                        createdAt: new Date("2026-06-01T09:00:00Z").toISOString(),
                    },
                    {
                        id: "proxy-002",
                        fullName: "Grace Nakiru",
                        phoneNumber: "+254711223344",
                        nationalId: "38471629",
                        relationship: "Village Elder",
                        assignedCount: 9,
                        createdAt: new Date("2026-06-05T10:30:00Z").toISOString(),
                    },
                    {
                        id: "proxy-003",
                        fullName: "Peter Lokoyen",
                        phoneNumber: "+254722334455",
                        nationalId: "47293810",
                        relationship: "Field Staff",
                        assignedCount: 22,
                        createdAt: new Date("2026-06-10T08:15:00Z").toISOString(),
                    },
                    {
                        id: "proxy-004",
                        fullName: "Mary Atieno",
                        phoneNumber: "+254733445566",
                        nationalId: "56382910",
                        relationship: "Relative",
                        assignedCount: 3,
                        createdAt: new Date("2026-06-15T14:00:00Z").toISOString(),
                    },
                    {
                        id: "proxy-005",
                        fullName: "Samuel Ekai",
                        phoneNumber: "+254744556677",
                        nationalId: "65471834",
                        relationship: "Neighbor",
                        assignedCount: 7,
                        createdAt: new Date("2026-06-20T11:45:00Z").toISOString(),
                    },
                ],
                pagination: { pages: 1, total: 5 },
            };
        },
        placeholderData: (prev) => prev,
    });

    return query;
};
