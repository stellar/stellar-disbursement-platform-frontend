import { useQueries } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { fetchApi } from "@/helpers/fetchApi";

import { AppError, UserRole } from "@/types";

// The write actions the backend gates per (user, distribution account) — the shape of the
// `capabilities` object of GET /distribution-wallets/{id}/capabilities.
export type WalletCapabilities = {
  can_create_disbursement: boolean;
  can_start_disbursement: boolean;
  can_pause_disbursement: boolean;
  can_cancel_disbursement: boolean;
  can_create_payment: boolean;
  can_retry_payment: boolean;
  can_cancel_payment: boolean;
};

export type WalletCapabilitiesResponse = {
  wallet_id: string;
  // Echoed back only when the read was parameterized; `role` present marks the answer hypothetical.
  user_id?: string;
  role?: UserRole;
  capabilities: WalletCapabilities;
};

export type WalletRoleCapabilities = {
  role: UserRole;
  capabilities: WalletCapabilities | null;
};

export type WalletRoleCapabilitiesResult = {
  byRole: WalletRoleCapabilities[];
  isLoading: boolean;
  error: AppError | null;
};

// Owner-only: what each membership role WOULD yield for one user on one distribution account,
// asked of the server one role at a time (?user_id=&role=). The backend owns the capability
// matrix and the conformance test that pins it; this only renders the answer, so the grant
// picker can say what a role actually buys before it is granted.
//
// Two things the answers do not say, and that callers must not infer:
//   - a hypothetical is computed from `role` alone, never unioned with the user's existing rows;
//   - the matrix covers write actions only. Every membership confers read visibility, so an
//     all-false answer means "view only", not "no effect".
export const useWalletRoleCapabilities = (
  walletId: string | null,
  userId: string | null,
  roles: UserRole[],
): WalletRoleCapabilitiesResult => {
  // Nothing to ask until a grantee is picked — and the endpoint 400s on role-without-user anyway.
  const enabled = Boolean(walletId && userId);

  return useQueries({
    queries: roles.map((role) => ({
      // Keyed per (wallet, user, role), so re-picking a grantee re-uses everything already
      // fetched for them instead of refiring one request per role.
      queryKey: ["distribution-wallet-capabilities", walletId, userId, role],
      queryFn: async (): Promise<WalletCapabilitiesResponse> =>
        await fetchApi(
          `${API_URL}/distribution-wallets/${walletId}/capabilities?user_id=${encodeURIComponent(
            userId ?? "",
          )}&role=${encodeURIComponent(role)}`,
        ),
      enabled,
    })),
    combine: (results): WalletRoleCapabilitiesResult => {
      // One failure (403 for a non-owner, 404 for a stale wallet) is reported for the whole set:
      // a partial matrix would annotate some roles and silently drop others.
      const failed = results.find((result) => result.error);

      return {
        byRole: results.map((result, index) => ({
          role: roles[index],
          capabilities: result.data?.capabilities ?? null,
        })),
        isLoading: results.some((result) => result.isLoading),
        error: failed?.error ?? null,
      };
    },
  });
};
