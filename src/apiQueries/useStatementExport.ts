import { useMutation } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";
import { SESSION_EXPIRED_EVENT } from "@/constants/settings";
import { fetchApi } from "@/helpers/fetchApi";
import { normalizeApiError } from "@/helpers/normalizeApiError";
import { saveFile } from "@/helpers/saveFile";
import { stripProtocolFromBaseUrl } from "@/helpers/stripProtocolFromBaseUrl";
import { AppError, StatementQueryParams } from "@/types";

function statementFilename(fromDate: string, toDate: string): string {
  const from = fromDate.replaceAll("-", "");
  const to = toDate.replaceAll("-", "");
  return `statement_${from}-${to}.pdf`;
}

function getFilenameFromContentDisposition(header: string | null, fallback: string): string {
  if (!header) return fallback;
  const re = /filename=(?:"([^"]+)"|([^;\s]+))/;
  const match = re.exec(header);
  return match ? (match[1] ?? match[2]).trim() : fallback;
}

async function handleStatementExportResponse(
  response: Response,
  params: StatementQueryParams,
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
    const fallback = statementFilename(params.fromDate, params.toDate);
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

export const useStatementExport = () => {
  const mutation = useMutation<void, AppError, StatementQueryParams>({
    mutationFn: (params: StatementQueryParams): Promise<void> =>
      new Promise<void>((resolve, reject) => {
        const searchParams = new URLSearchParams({
          from_date: params.fromDate,
          to_date: params.toDate,
        });
        if (params.assetCode) searchParams.set("asset_code", params.assetCode);
        if (params.baseUrl) {
          searchParams.set("base_url", stripProtocolFromBaseUrl(params.baseUrl));
        }
        const url = `${API_URL}/statements/export?${searchParams.toString()}`;

        const fetchResult = fetchApi(
          url,
          {},
          {
            customCallback: (response: Response) => {
              void handleStatementExportResponse(response, params, resolve, reject);
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
