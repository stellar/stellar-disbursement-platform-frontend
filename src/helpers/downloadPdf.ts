import { fetchApi, sessionExpired } from "@/helpers/fetchApi";
import { getFilenameFromContentDisposition } from "@/helpers/getFilenameFromContentDisposition";
import { normalizeApiError } from "@/helpers/normalizeApiError";
import { saveFile } from "@/helpers/saveFile";

// Fetches a PDF and saves it under the server's filename, or fallbackFilename when none is sent.
export const downloadPdf = (url: string, fallbackFilename: string, walletId?: string) =>
  fetchApi(
    url,
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
          fallbackFilename,
        );
        saveFile({
          file: new File([blob], filename, { type: "application/pdf" }),
          suggestedFileName: filename,
        });
      },
    },
  );
