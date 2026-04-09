import { useMutation } from "@tanstack/react-query";

import { authenticatePasskey } from "@/api/passkeyAuthentication";
import type { PasskeyAuthenticationFinishResponse } from "@/api/passkeyAuthentication";

import type { AppError } from "@/types";

export const usePasskeyAuthentication = () => {
  const mutation = useMutation({
    mutationFn: () => {
      return authenticatePasskey();
    },
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as PasskeyAuthenticationFinishResponse,
    mutateAsync: () => mutation.mutateAsync(),
  };
};
