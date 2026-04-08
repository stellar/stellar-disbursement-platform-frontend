import { useMutation } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";
import { SESSION_EXPIRED_EVENT } from "@/constants/settings";
import { fetchApi } from "@/helpers/fetchApi";
import { getDomainFromUrl } from "@/helpers/getDomainFromUrl";
import { getFilenameFromContentDisposition } from "@/helpers/getFilenameFromContentDisposition";
import { normalizeApiError } from "@/helpers/normalizeApiError";
import { saveFile } from "@/helpers/saveFile";
import { AppError, StatementQueryParams } from "@/types";

function statementFilename(fromDate: string, toDate: string): string {
  const from = fromDate.replaceAll("-", "");
  const to = toDate.replaceAll("-", "");
  return `statement_${from}-${to}.pdf`;
}

export const useStatementExport = () => {
  const mutation = useMutation<void, AppError, StatementQueryParams>({
    mutationFn: async (params: StatementQueryParams): Promise<void> => {
      const searchParams = new URLSearchParams({
        from_date: params.fromDate,
        to_date: params.toDate,
      });
      if (params.assetCode) searchParams.set("asset_code", params.assetCode);
      if (params.baseUrl) {
        searchParams.set("base_url", getDomainFromUrl(params.baseUrl));
      }
      const url = `${API_URL}/reports/statement?${searchParams.toString()}`;

      await fetchApi(
        url,
        {},
        {
          customCallback: async (response: Response) => {
            if (response.status === 401) {
              document.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
              return;
            }
            if (!response.ok) {
              const err = await response.json().catch(() => ({}));
              throw normalizeApiError(err);
            }
            const blob = await response.blob();
            const fallback = statementFilename(params.fromDate, params.toDate);
            const filename = getFilenameFromContentDisposition(
              response.headers.get("Content-Disposition"),
              fallback,
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
