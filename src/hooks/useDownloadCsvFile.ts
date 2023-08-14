import { useCallback, useEffect, useState } from "react";
import { useRedux } from "hooks/useRedux";
import { getInstructionsFile } from "helpers/getInstructionsFile";

export const useDownloadCsvFile = (
  callback: (file: File) => void,
  enableUseEffect?: boolean,
) => {
  const { userAccount, disbursementDetails } = useRedux(
    "userAccount",
    "disbursementDetails",
  );
  const [isLoading, setIsLoading] = useState(false);

  const getFile = useCallback(async () => {
    if (
      disbursementDetails.details.fileName &&
      disbursementDetails.details.id &&
      userAccount.token
    ) {
      setIsLoading(true);

      const file = await getInstructionsFile({
        token: userAccount.token,
        disbursementId: disbursementDetails.details.id,
        fileName: disbursementDetails.details.fileName,
      });

      callback(file);
      setIsLoading(false);
    }
  }, [
    callback,
    disbursementDetails.details.fileName,
    disbursementDetails.details.id,
    userAccount.token,
  ]);

  useEffect(() => {
    if (enableUseEffect && disbursementDetails.details.fileName) {
      getFile();
    }
  }, [enableUseEffect, disbursementDetails.details.fileName, getFile]);

  return { isLoading, getFile };
};
