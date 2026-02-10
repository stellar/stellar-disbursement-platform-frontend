import { useMutation } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";
import { SESSION_EXPIRED_EVENT } from "@/constants/settings";
import { fetchApi } from "@/helpers/fetchApi";
import { normalizeApiError } from "@/helpers/normalizeApiError";
import { saveFile } from "@/helpers/saveFile";
import { stripProtocolFromBaseUrl } from "@/helpers/stripProtocolFromBaseUrl";
import { AppError } from "@/types";

export const INTERNAL_NOTES_MAX_LENGTH = 900;

export type TransactionNoticeExportParams = {
  paymentId: string;
  internalNotes?: string;
  baseUrl?: string;
};

function getFilenameFromContentDisposition(header: string | null, fallback: string): string {
  if (!header) return fallback;
  const re = /filename=(?:"([^"]+)"|([^;\s]+))/;
  const match = re.exec(header);
  return match ? (match[1] ?? match[2]).trim() : fallback;
}

async function handleTransactionNoticeExportResponse(
  response: Response,
  paymentId: string,
  resolve: () => void,
  reject: (reason: unknown) => void,
): Promise<void> {
  try {
    if (response.status === 401) {
      document.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
      resolve();
      return;
    }
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw normalizeApiError(err);
    }
    const blob = await response.blob();
    const fallback = `transaction_notice_${paymentId}.pdf`;
    const filename = getFilenameFromContentDisposition(
      response.headers.get("Content-Disposition"),
      fallback,
    );
    saveFile({
      file: new File([blob], filename, { type: "application/pdf" }),
      suggestedFileName: filename,
    });
    resolve();
  } catch (e) {
    reject(e);
  }
}

export const useTransactionNoticeExport = () => {
  const mutation = useMutation<void, AppError, TransactionNoticeExportParams>({
    mutationFn: (params: TransactionNoticeExportParams): Promise<void> =>
      new Promise<void>((resolve, reject) => {
        const searchParams = new URLSearchParams();
        if (params.internalNotes) {
          const notes =
            params.internalNotes.length > INTERNAL_NOTES_MAX_LENGTH
              ? params.internalNotes.slice(0, INTERNAL_NOTES_MAX_LENGTH)
              : params.internalNotes;
          searchParams.set("internal_notes", notes);
        }
        if (params.baseUrl) {
          searchParams.set("base_url", stripProtocolFromBaseUrl(params.baseUrl));
        }
        const queryString = searchParams.toString();
        const queryPart = queryString ? `?${queryString}` : "";
        const url = `${API_URL}/payments/${params.paymentId}/export${queryPart}`;

        const fetchResult = fetchApi(
          url,
          {},
          {
            customCallback: (response: Response) => {
              void handleTransactionNoticeExportResponse(
                response,
                params.paymentId,
                resolve,
                reject,
              );
            },
          },
        );

        if (fetchResult instanceof Promise) {
          fetchResult.catch((error: unknown) => {
            reject(error);
          });
        }
      }),
  });

  return mutation;
};
