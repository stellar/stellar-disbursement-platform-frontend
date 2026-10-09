import { useMutation } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { fetchApi, sessionExpired } from "@/helpers/fetchApi";
import { getFilenameFromContentDisposition } from "@/helpers/getFilenameFromContentDisposition";
import { normalizeApiError } from "@/helpers/normalizeApiError";
import { saveFile } from "@/helpers/saveFile";

import { AppError, StatementQueryParams } from "@/types";

export const useStatementExport = () => {
  const mutation = useMutation<void, AppError, StatementQueryParams>({
    mutationFn: async ({ walletId, fromDate, toDate, assetCode }): Promise<void> => {
      const searchParams = new URLSearchParams({ from_date: fromDate, to_date: toDate });
      if (assetCode) searchParams.set("asset_code", assetCode);

      await fetchApi(
        `${API_URL}/reports/statement?${searchParams.toString()}`,
        {},
        {
          walletId,
          customCallback: async (response: Response) => {
            if (response.status === 401) {
              throw sessionExpired();
            }
            if (!response.ok) {
              const err = await response.json().catch(() => ({}));
              throw normalizeApiError(err);
            }
            const blob = await response.blob();
            const filename = getFilenameFromContentDisposition(
              response.headers.get("Content-Disposition"),
              `statement_${fromDate}-${toDate}.pdf`,
            );
            saveFile({
              file: new File([blob], filename, { type: "application/pdf" }),
              suggestedFileName: filename,
            });
          },
        },
      );
    },
  });

  return mutation;
};
