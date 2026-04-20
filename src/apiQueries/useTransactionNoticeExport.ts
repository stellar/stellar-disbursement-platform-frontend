import { useMutation } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";
import { SESSION_EXPIRED_EVENT } from "@/constants/settings";
import { fetchApi } from "@/helpers/fetchApi";
import { getDomainFromUrl } from "@/helpers/getDomainFromUrl";
import { getFilenameFromContentDisposition } from "@/helpers/getFilenameFromContentDisposition";
import { normalizeApiError } from "@/helpers/normalizeApiError";
import { saveFile } from "@/helpers/saveFile";
import { AppError } from "@/types";

export const INTERNAL_NOTES_MAX_LENGTH = 500;

export type TransactionNoticeExportParams = {
  paymentId: string;
  internalNotes?: string;
  baseUrl?: string;
};

export const useTransactionNoticeExport = () => {
  const mutation = useMutation<void, AppError, TransactionNoticeExportParams>({
    mutationFn: async (params: TransactionNoticeExportParams): Promise<void> => {
      const searchParams = new URLSearchParams();
      if (params.internalNotes) {
        const notes =
          params.internalNotes.length > INTERNAL_NOTES_MAX_LENGTH
            ? params.internalNotes.slice(0, INTERNAL_NOTES_MAX_LENGTH)
            : params.internalNotes;
        searchParams.set("internal_notes", notes);
      }
      if (params.baseUrl) {
        searchParams.set("base_url", getDomainFromUrl(params.baseUrl));
      }
      const queryString = searchParams.toString();
      const queryPart = queryString ? `?${queryString}` : "";
      const url = `${API_URL}/reports/payment/${params.paymentId}${queryPart}`;

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
            const fallback = `transaction_notice_${params.paymentId}.pdf`;
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
