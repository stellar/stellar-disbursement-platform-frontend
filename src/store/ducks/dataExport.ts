import { createAsyncThunk } from "@reduxjs/toolkit";
import { getExport } from "@/api/getExport";
import { normalizeApiError } from "@/helpers/normalizeApiError";
import { endSessionIfTokenInvalid } from "@/helpers/endSessionIfTokenInvalid";
import { refreshSessionToken } from "@/helpers/refreshSessionToken";
import { RootState } from "@/store";
import { ApiError, Export, RejectMessage } from "@/types";
type ExportParams<T> = {
  exportType: Export;
  searchParams?: T;
  // Multi-wallet: the account the exported list is scoped to, passed in from the SelectedWallet
  // context so the export matches the rows on screen. Empty means "All accounts".
  walletId?: string;
};

export const exportDataAction = createAsyncThunk<
  undefined,
  ExportParams<any>,
  { rejectValue: RejectMessage; state: RootState }
>(
  "common/exportDataAction",
  async ({ exportType, searchParams, walletId }, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      await getExport(token, exportType, searchParams, walletId);
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
