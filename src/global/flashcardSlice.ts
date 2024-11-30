import { createSlice } from "@reduxjs/toolkit";

import {
  type FlashcardType,
  type LearningMode,
  type ScreenMode,
} from "@/types/types";

export const FLASHCARD_SLICE_NAME = "flashcard";

type FlashcardState = {
  flashcard: FlashcardType[];
  isLearningMode: boolean;
  isVisibleParent: boolean;
  learningMode: LearningMode;
  screenMode: ScreenMode;
  saveInfo: {
    saved: boolean;
    data: {
      value: boolean;
      watch: boolean;
    }[];
  };
};

const initialState: FlashcardState = {
  flashcard: [],
  isLearningMode: true,
  isVisibleParent: true,
  learningMode: "origin",
  screenMode: "translate",
  saveInfo: {
    saved: true,
    data: [],
  },
};

const slice = createSlice({
  name: FLASHCARD_SLICE_NAME,
  initialState,
  reducers: {
    changeFlashcard: (state, action) => {
      state.flashcard = action.payload;
      while (state.saveInfo.data.length < action.payload.length) {
        state.saveInfo.data.unshift({ value: true, watch: true });
      }
      state.saveInfo.saved = true;
    },
    changeFlashcardLeef: (state, action) => {
      const { data, index } = action.payload;
      state.flashcard[index] = data;
    },
    addFlashcardLeef: (state, action) => {
      state.flashcard = [action.payload, ...state.flashcard];
      state.saveInfo.saved = false;
      state.saveInfo.data = [
        { value: false, watch: false },
        ...state.saveInfo.data,
      ];
    },
    changeSaveInfo: (state, action) => {
      state.saveInfo.saved = action.payload;
    },
    deleteFlashcardLeef: (state, action) => {
      state.flashcard = state.flashcard.filter((_, i) => i !== action.payload);
      state.saveInfo.data = state.saveInfo.data.filter(
        (_, i) => i !== action.payload
      );
    },
    toggleLearningMode: (state) => {
      state.isLearningMode = !state.isLearningMode;
    },
    toggleVisibleParent: (state) => {
      state.isVisibleParent = !state.isVisibleParent;
    },
    changeLearningMode: (state, action) => {
      state.learningMode = action.payload;
    },
    informSaveAll: (state) => {
      state.saveInfo.data = state.saveInfo.data.map((prev) => ({
        value: true,
        watch: !prev.watch,
      }));
      state.saveInfo.saved = true;
    },
    resetFlashcard: (state, action) => {
      state.flashcard = [];
      state.isLearningMode = action.payload !== "translate";
      state.isVisibleParent = true;
      state.learningMode = "origin";
      state.screenMode = action.payload;
      state.saveInfo = {
        saved: true,
        data: [],
      };
    },
  },
});

export const {
  changeFlashcard,
  changeFlashcardLeef,
  addFlashcardLeef,
  changeSaveInfo,
  deleteFlashcardLeef,
  toggleLearningMode,
  toggleVisibleParent,
  changeLearningMode,
  informSaveAll,
  resetFlashcard,
} = slice.actions;
export const flashcardReducer = slice.reducer;
