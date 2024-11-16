import { configureStore } from "@reduxjs/toolkit";

import { flashcardReducer, FLASHCARD_SLICE_NAME } from "./flashcardSlice";
import { TRANSLATE_SLICE_NAME, translateReducer } from "./translateSlice";

const store = configureStore({
  reducer: {
    [FLASHCARD_SLICE_NAME]: flashcardReducer,
    [TRANSLATE_SLICE_NAME]: translateReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
