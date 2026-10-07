import { useQuery } from "@tanstack/react-query";
import { handleSearchParams } from "@/api/handleSearchParams";
import { API_URL } from "@/constants/envVariables";
import { fetchApi } from "@/helpers/fetchApi";
import { formatReceivers } from "@/helpers/formatReceivers";
import { ALL_ACCOUNTS } from "@/helpers/localStorageSelectedWallet";
import { ApiReceivers, AppError, ReceiversSearchParams } from "@/types";

export const useReceivers = (
  searchParams?: ReceiversSearchParams,
  selectedWalletId?: string | null,
) => {
  // ALL status is for UI only
  if (searchParams?.status === "ALL") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { status, ...searchParamsWithoutStatus } = searchParams;
    searchParams = searchParamsWithoutStatus;
  }

  const params = handleSearchParams(searchParams);

  // The list is wallet-scoped on the wire, so the cache entry is keyed by the same account
  // that produced its X-Wallet-Id header — key and header can never disagree.
  const walletKey = selectedWalletId || ALL_ACCOUNTS;

  const query = useQuery<ApiReceivers, AppError>({
    queryKey: ["receivers", walletKey, { ...searchParams }],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/receivers/${params}`, undefined, {
        walletId: selectedWalletId || null,
      });
    },
    // Only keep the previous rows while paging/filtering within the same account; showing
    // another account's receivers during a switch is a disclosure, not a nicety.
    placeholderData: (prev, prevQuery) => (prevQuery?.queryKey[1] === walletKey ? prev : undefined),
  });

  return {
    ...query,
    data: query.data
      ? {
          ...query.data,
          data: formatReceivers(query.data.data),
        }
      : undefined,
  };
};
