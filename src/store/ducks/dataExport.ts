import { createAsyncThunk } from "@reduxjs/toolkit";
import { getExport } from "api/getExport";
import { normalizeApiError } from "helpers/normalizeApiError";
import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";
import { refreshSessionToken } from "helpers/refreshSessionToken";
import { RootState } from "store";
import { ApiError, Export, RejectMessage } from "types";
type ExportParams<T> = {
  exportType: Export;
  searchParams?: T;
};

export const exportDataAction = createAsyncThunk<
  undefined,
  ExportParams<any>,
  { rejectValue: RejectMessage; state: RootState }
>(
  "common/exportDataAction",
  async (
    { exportType, searchParams },
    { rejectWithValue, getState, dispatch },
  ) => {
    const { token } = getState().userAccount;

    try {
      await getExport(token, exportType, searchParams);
      refreshSessionToken(dispatch);
      return;
    } catch (error: unknown) {
      const apiError = normalizeApiError(error as ApiError);
      const errorString = apiError.message;
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error exporting ${exportType}: ${errorString}`,
      });
    }
  },
);
