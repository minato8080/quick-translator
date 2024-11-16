import { createSlice } from "@reduxjs/toolkit";

import type { LanguagesKeys } from "@/types/types";

export const TRANSLATE_SLICE_NAME = "translate";

type translateState = {
  input: string;
  output: string;
  sourceLang: LanguagesKeys;
  targetLang: LanguagesKeys;
  loading: boolean;
};

const initialState: translateState = {
  input: "",
  output: "",
  sourceLang: "en",
  targetLang: "ja",
  loading: false,
};

const slice = createSlice({
  name: TRANSLATE_SLICE_NAME,
  initialState,
  reducers: {
    changeInput: (state, action) => {
      state.input = action.payload;
    },
    changeOutput: (state, action) => {
      state.output = action.payload;
    },
    changeLoading: (state, action) => {
      state.loading = action.payload;
    },
    swapLanguages: (state) => {
      const stash = state.sourceLang;
      state.sourceLang = state.targetLang;
      state.targetLang = stash;
      state.input = state.output;
      state.output = "";
    },
  },
});

export const { changeInput, changeOutput, changeLoading,swapLanguages } = slice.actions;
export const translateReducer = slice.reducer;
