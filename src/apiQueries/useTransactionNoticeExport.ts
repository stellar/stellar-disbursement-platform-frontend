import { useMutation } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { downloadPdf } from "@/helpers/downloadPdf";

import { AppError } from "@/types";

export const INTERNAL_NOTES_MAX_LENGTH = 500;

export type TransactionNoticeExportParams = {
  paymentId: string;
  internalNotes?: string;
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
      const queryString = searchParams.toString();
      const queryPart = queryString ? `?${queryString}` : "";
      const url = `${API_URL}/reports/payment/${params.paymentId}${queryPart}`;

      await downloadPdf(url, `transaction_notice_${params.paymentId}.pdf`);
    },
  });

  return mutation;
};
