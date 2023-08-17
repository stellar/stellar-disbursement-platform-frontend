import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "store";
import { getDisbursementDrafts } from "api/getDisbursementDrafts";
import { postDisbursement } from "api/postDisbursement";
import { postDisbursementFile } from "api/postDisbursementFile";
import { patchDisbursementStatus } from "api/patchDisbursementStatus";
import { handleApiErrorString } from "api/handleApiErrorString";
import { formatDisbursement } from "helpers/formatDisbursements";
import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";
import { refreshSessionToken } from "helpers/refreshSessionToken";
import {
  ApiError,
  Disbursement,
  DisbursementDraft,
  DisbursementDraftRejectMessage,
  DisbursementDraftsInitialState,
  Pagination,
  RejectMessage,
} from "types";

export const getDisbursementDraftsAction = createAsyncThunk<
  {
    items: DisbursementDraft[];
    pagination: Pagination;
  },
  undefined,
  { rejectValue: RejectMessage; state: RootState }
>(
  "disbursementDrafts/getDisbursementDraftsAction",
  async (_, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const { data, pagination } = await getDisbursementDrafts(token);
      refreshSessionToken(dispatch);

      return {
        items: data.map((d) => ({
          details: formatDisbursement(d),
          // TODO: get instructions once we have them in response
          instructions: {
            csvFile: undefined,
            csvName: undefined,
          },
        })),
        pagination,
      };
    } catch (error: unknown) {
      const errorString = handleApiErrorString(error as ApiError);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching drafts: ${errorString}`,
      });
    }
  },
);

export const saveDisbursementDraftAction = createAsyncThunk<
  string,
  {
    details: Disbursement;
    file?: File;
  },
  { rejectValue: DisbursementDraftRejectMessage; state: RootState }
>(
  "disbursementDrafts/saveDisbursementDraftAction",
  async ({ details, file }, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;
    const { newDraftId } = getState().disbursementDrafts;

    let draftId;

    try {
      draftId = newDraftId ?? (await postDisbursement(token, details)).id;

      if (file) {
        await postDisbursementFile(token, draftId, file);
        refreshSessionToken(dispatch);

        return draftId;
      } else {
        refreshSessionToken(dispatch);

        return draftId;
      }
    } catch (error: unknown) {
      const err = error as ApiError;
      const errorString = handleApiErrorString(err);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error saving draft: ${errorString}`,
        errorExtras: err?.extras,
        // Need to save draft ID if it failed because of CSV upload
        newDraftId: draftId,
      });
    }
  },
);

export const submitDisbursementNewDraftAction = createAsyncThunk<
  string,
  {
    details: Disbursement;
    file: File;
  },
  { rejectValue: DisbursementDraftRejectMessage; state: RootState }
>(
  "disbursementDrafts/submitDisbursementNewDraftAction",
  async ({ details, file }, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;
    const { id } = getState().disbursementDetails.details;
    const { newDraftId } = getState().disbursementDrafts;

    let draftId = id ?? newDraftId;

    try {
      if (!draftId) {
        const newDisbursement = await postDisbursement(token, details);
        draftId = newDisbursement.id;
      }

      await postDisbursementFile(token, draftId, file);
      await patchDisbursementStatus(token, draftId, "STARTED");
      refreshSessionToken(dispatch);

      return draftId;
    } catch (error: unknown) {
      const err = error as ApiError;
      const errorString = handleApiErrorString(err);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error submitting disbursement: ${errorString}`,
        errorExtras: err?.extras,
        // Need to save draft ID if it failed because of CSV upload
        newDraftId: draftId,
      });
    }
  },
);

export const saveNewCsvFileAction = createAsyncThunk<
  boolean,
  {
    savedDraftId: string;
    file: File;
  },
  { rejectValue: DisbursementDraftRejectMessage; state: RootState }
>(
  "disbursementDrafts/saveNewCsvFileAction",
  async ({ savedDraftId, file }, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;
    try {
      await postDisbursementFile(token, savedDraftId, file);
      refreshSessionToken(dispatch);

      return true;
    } catch (error: unknown) {
      const err = error as ApiError;
      const errorString = handleApiErrorString(err);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error uploading new CSV file: ${errorString}`,
        errorExtras: err?.extras,
      });
    }
  },
);

export const submitDisbursementSavedDraftAction = createAsyncThunk<
  string,
  {
    // savedDraftId is always there for saved drafts, comes from the URL
    savedDraftId?: string;
    details: Disbursement;
    file: File;
  },
  { rejectValue: DisbursementDraftRejectMessage; state: RootState }
>(
  "disbursementDrafts/submitDisbursementSavedDraftAction",
  async (
    { details, file, savedDraftId },
    { rejectWithValue, getState, dispatch },
  ) => {
    const { isApprovalRequired } = getState().organization.data;
    const { token } = getState().userAccount;
    const { id } = getState().disbursementDetails.details;
    const { newDraftId } = getState().disbursementDrafts;
    let draftId;

    try {
      draftId =
        savedDraftId ??
        // We might not need all of these ID checks, but I'll leave them here
        // for now just in case
        id ??
        newDraftId ??
        (await postDisbursement(token, details)).id;

      if (!isApprovalRequired) {
        await postDisbursementFile(token, draftId, file);
      }

      await patchDisbursementStatus(token, draftId, "STARTED");
      refreshSessionToken(dispatch);

      return draftId;
    } catch (error: unknown) {
      const err = error as ApiError;
      const errorString = handleApiErrorString(err);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error submitting disbursement: ${errorString}`,
        errorExtras: err?.extras,
        // Need to save draft ID if it failed because of CSV upload
        newDraftId: draftId,
      });
    }
  },
);

const initialState: DisbursementDraftsInitialState = {
  items: [],
  status: undefined,
  newDraftId: undefined,
  pagination: undefined,
  errorString: undefined,
  errorExtras: undefined,
  actionType: undefined,
  isCsvFileUpdated: undefined,
};

const disbursementDraftsSlice = createSlice({
  name: "disbursementDrafts",
  initialState,
  reducers: {
    resetDisbursementDraftsAction: () => initialState,
    clearDisbursementDraftsErrorAction: (state) => {
      state.errorString = undefined;
      state.errorExtras = undefined;
      state.status = "SUCCESS";
      state.actionType = undefined;
    },
    setDraftIdAction: (state, action: PayloadAction<string | undefined>) => {
      state.newDraftId = action.payload;
    },
    clearCsvUpdatedAction: (state) => {
      state.isCsvFileUpdated = false;
    },
  },
  extraReducers: (builder) => {
    // Get disbursement drafts
    builder.addCase(
      getDisbursementDraftsAction.pending,
      (state = initialState) => {
        state.status = "PENDING";
      },
    );
    builder.addCase(getDisbursementDraftsAction.fulfilled, (state, action) => {
      state.items = action.payload.items;
      state.pagination = action.payload.pagination;
      state.status = "SUCCESS";
      state.newDraftId = undefined;
      state.errorString = undefined;
      state.errorExtras = undefined;
      state.actionType = undefined;
    });
    builder.addCase(getDisbursementDraftsAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });
    // Save disbursement draft
    builder.addCase(
      saveDisbursementDraftAction.pending,
      (state = initialState) => {
        state.status = "PENDING";
        state.actionType = "save";
      },
    );
    builder.addCase(saveDisbursementDraftAction.fulfilled, (state, action) => {
      state.newDraftId = action.payload;
      state.status = "SUCCESS";
      state.errorString = undefined;
      state.errorExtras = undefined;
    });
    builder.addCase(saveDisbursementDraftAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
      state.errorExtras = action.payload?.errorExtras;
      state.newDraftId = action.payload?.newDraftId;
    });
    // Submit new disbursement
    builder.addCase(
      submitDisbursementNewDraftAction.pending,
      (state = initialState) => {
        state.status = "PENDING";
        state.actionType = "submit";
      },
    );
    builder.addCase(
      submitDisbursementNewDraftAction.fulfilled,
      (state, action) => {
        state.newDraftId = action.payload;
        state.status = "SUCCESS";
        state.errorString = undefined;
      },
    );
    builder.addCase(
      submitDisbursementNewDraftAction.rejected,
      (state, action) => {
        state.status = "ERROR";
        state.errorString = action.payload?.errorString;
        state.errorExtras = action.payload?.errorExtras;
        state.newDraftId = action.payload?.newDraftId;
      },
    );
    // Submit new CSV file
    builder.addCase(saveNewCsvFileAction.pending, (state = initialState) => {
      state.status = "PENDING";
    });
    builder.addCase(saveNewCsvFileAction.fulfilled, (state, action) => {
      state.isCsvFileUpdated = action.payload;
      state.status = "SUCCESS";
      state.errorString = undefined;
    });
    builder.addCase(saveNewCsvFileAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
      state.errorExtras = action.payload?.errorExtras;
    });
    // Submit saved disbursement
    builder.addCase(
      submitDisbursementSavedDraftAction.pending,
      (state = initialState) => {
        state.status = "PENDING";
        state.actionType = "submit";
      },
    );
    builder.addCase(
      submitDisbursementSavedDraftAction.fulfilled,
      (state, action) => {
        state.newDraftId = action.payload;
        state.status = "SUCCESS";
        state.errorString = undefined;
      },
    );
    builder.addCase(
      submitDisbursementSavedDraftAction.rejected,
      (state, action) => {
        state.status = "ERROR";
        state.errorString = action.payload?.errorString;
        state.errorExtras = action.payload?.errorExtras;
        state.newDraftId = action.payload?.newDraftId;
      },
    );
  },
});

export const disbursementDraftsSelector = (state: RootState) =>
  state.disbursementDrafts;
export const { reducer } = disbursementDraftsSlice;
export const {
  resetDisbursementDraftsAction,
  clearDisbursementDraftsErrorAction,
  setDraftIdAction,
  clearCsvUpdatedAction,
} = disbursementDraftsSlice.actions;
