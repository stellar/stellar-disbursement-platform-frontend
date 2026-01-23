import { useMutation } from "@tanstack/react-query";

import { registerPasskey } from "@/api/passkeyRegistration";
import type { PasskeyRegistrationFinishResponse } from "@/api/passkeyRegistration";
import type { AppError } from "@/types";

export const usePasskeyRegistration = () => {
  const mutation = useMutation({
    mutationFn: ({ token }: { token: string }) => {
      return registerPasskey(token);
    },
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as PasskeyRegistrationFinishResponse,
    mutateAsync: ({ token }: { token: string }) => mutation.mutateAsync({ token }),
  };
};
