import { useQuery } from "@tanstack/react-query";
import { handleSearchParams } from "@/api/handleSearchParams";
import { API_URL } from "@/constants/envVariables";
import { fetchApi } from "@/helpers/fetchApi";
import { ALL_ACCOUNTS } from "@/helpers/localStorageSelectedWallet";
import { ApiPayments, AppError, PaymentsSearchParams } from "@/types";

export const usePayments = (
  searchParams?: PaymentsSearchParams,
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

  const query = useQuery<ApiPayments, AppError>({
    queryKey: ["payments", walletKey, { ...searchParams }],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/payments/${params}`, undefined, {
        walletId: selectedWalletId || null,
      });
    },
    // Only keep the previous rows while paging/filtering within the same account; showing
    // another account's payments during a switch is a disclosure, not a nicety.
    placeholderData: (prev, prevQuery) => (prevQuery?.queryKey[1] === walletKey ? prev : undefined),
  });

  return query;
};
