import { useMutation } from "@tanstack/react-query";

import { refreshPasskeyToken } from "@/api/passkeyRefresh";
import type { PasskeyRefreshResponse } from "@/api/passkeyRefresh";

import type { AppError } from "@/types";

export const usePasskeyRefresh = () => {
  const mutation = useMutation({
    mutationFn: ({ token }: { token: string }) => {
      return refreshPasskeyToken(token);
    },
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as PasskeyRefreshResponse,
    mutateAsync: ({ token }: { token: string }) => mutation.mutateAsync({ token }),
  };
};
