import { createAsyncThunk } from "@reduxjs/toolkit";

import { getExport } from "@/api/getExport";

import { endSessionIfTokenInvalid } from "@/helpers/endSessionIfTokenInvalid";
import { normalizeApiError } from "@/helpers/normalizeApiError";
import { refreshSessionToken } from "@/helpers/refreshSessionToken";

import { ApiError, Export, RejectMessage } from "@/types";

import { RootState } from "@/store";
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
  async ({ exportType, searchParams }, { rejectWithValue, getState, dispatch }) => {
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
