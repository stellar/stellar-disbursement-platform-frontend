import { useMutation } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { downloadPdf } from "@/helpers/downloadPdf";

import { AppError, StatementQueryParams } from "@/types";

export const useStatementExport = () => {
  const mutation = useMutation<void, AppError, StatementQueryParams>({
    mutationFn: async ({ walletId, fromDate, toDate }): Promise<void> => {
      const searchParams = new URLSearchParams({ from_date: fromDate, to_date: toDate });

      await downloadPdf(
        `${API_URL}/reports/statement?${searchParams.toString()}`,
        `statement_${fromDate}-${toDate}.pdf`,
        walletId,
      );
    },
  });

  return mutation;
};
