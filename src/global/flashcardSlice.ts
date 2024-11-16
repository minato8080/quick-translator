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
    value: boolean;
    watch: boolean[];
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
    value: true,
    watch: [],
  },
};

const slice = createSlice({
  name: FLASHCARD_SLICE_NAME,
  initialState,
  reducers: {
    changeFlashcard: (state, action) => {
      state.flashcard = action.payload;
      while (state.saveInfo.watch.length < action.payload.length) {
        state.saveInfo.watch.unshift(true);
      }
      console.log(state.saveInfo.watch);
      state.saveInfo.saved = true;
    },
    changeFlashcardLeef: (state, action) => {
      const { data, index } = action.payload;
      state.flashcard[index] = data;
    },
    addFlashcardLeef: (state, action) => {
      state.flashcard = [action.payload, ...state.flashcard];
      state.saveInfo.saved = false;
      state.saveInfo.watch = [false, ...state.saveInfo.watch];
    },
    changeSaveInfo: (state, action) => {
      state.saveInfo.saved = action.payload;
    },
    deleteFlashcardLeef: (state, action) => {
      state.flashcard = state.flashcard.filter(
        (_, i) => i !== action.payload
      );
      state.saveInfo.watch = state.saveInfo.watch.filter(
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
    changeScreenMode: (state, action) => {
      state.isLearningMode = state.screenMode !== "translate";
      state.screenMode = action.payload;
    },
    informSaveAll: (state) => {
      state.saveInfo.watch = state.saveInfo.watch.map((prev) => !prev);
      state.saveInfo.saved = true;
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
  changeScreenMode,
  informSaveAll,
} = slice.actions;
export const flashcardReducer = slice.reducer;
