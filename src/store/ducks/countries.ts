import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "store";
import { getCountries } from "api/getCountries";
import { handleApiErrorString } from "api/handleApiErrorString";
import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";
import {
  ApiCountry,
  ApiError,
  CountriesInitialState,
  RejectMessage,
} from "types";

export const getCountriesAction = createAsyncThunk<
  ApiCountry[],
  undefined,
  { rejectValue: RejectMessage; state: RootState }
>(
  "countries/getCountriesAction",
  async (_, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const countries = await getCountries(token);
      return countries;
    } catch (error: unknown) {
      const errorString = handleApiErrorString(error as ApiError);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching countries: ${errorString}`,
      });
    }
  },
);

const initialState: CountriesInitialState = {
  items: [],
  status: undefined,
  errorString: undefined,
};

const countriesSlice = createSlice({
  name: "countries",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getCountriesAction.pending, (state = initialState) => {
      state.status = "PENDING";
    });
    builder.addCase(getCountriesAction.fulfilled, (state, action) => {
      state.items = action.payload;
      state.status = "SUCCESS";
      state.errorString = undefined;
    });
    builder.addCase(getCountriesAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });
  },
});

export const countriesSelector = (state: RootState) => state.countries;
export const { reducer } = countriesSlice;
