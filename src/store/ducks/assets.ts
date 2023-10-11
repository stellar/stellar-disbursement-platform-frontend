import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "store";
import { getAssets } from "api/getAssets";
import { getAssetsByWallet } from "api/getAssetsByWallet";
import { handleApiErrorString } from "api/handleApiErrorString";
import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";
import { ApiAsset, ApiError, AssetsInitialState, RejectMessage } from "types";

export const getAssetsAction = createAsyncThunk<
  ApiAsset[],
  undefined,
  { rejectValue: RejectMessage; state: RootState }
>(
  "assets/getAssetsAction",
  async (_, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const assets = await getAssets(token);
      // Don't show soft-deleted assets
      return assets.filter((a) => !a.deleted_at);
    } catch (error: unknown) {
      const errorString = handleApiErrorString(error as ApiError);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching assets: ${errorString}`,
      });
    }
  },
);

export const getAssetsByWalletAction = createAsyncThunk<
  ApiAsset[],
  { walletId: string },
  { rejectValue: RejectMessage; state: RootState }
>(
  "assets/getAssetsByWalletAction",
  async ({ walletId }, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const assets = await getAssetsByWallet(token, walletId);
      // Don't show soft-deleted assets
      return assets.filter((a) => !a.deleted_at);
    } catch (error: unknown) {
      const errorString = handleApiErrorString(error as ApiError);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching assets: ${errorString}`,
      });
    }
  },
);

const initialState: AssetsInitialState = {
  items: [],
  status: undefined,
  errorString: undefined,
};

const assetsSlice = createSlice({
  name: "assets",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAssetsAction.pending, (state = initialState) => {
      state.status = "PENDING";
    });
    builder.addCase(getAssetsAction.fulfilled, (state, action) => {
      state.items = action.payload;
      state.status = "SUCCESS";
      state.errorString = undefined;
    });
    builder.addCase(getAssetsAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });

    builder.addCase(getAssetsByWalletAction.pending, (state = initialState) => {
      state.status = "PENDING";
    });
    builder.addCase(getAssetsByWalletAction.fulfilled, (state, action) => {
      state.items = action.payload;
      state.status = "SUCCESS";
      state.errorString = undefined;
    });
    builder.addCase(getAssetsByWalletAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });
  },
});

export const assetsSelector = (state: RootState) => state.assets;
export const { reducer } = assetsSlice;
