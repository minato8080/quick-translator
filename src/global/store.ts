import { configureStore } from "@reduxjs/toolkit";

import { flashcardReducer, FLASHCARD_SLICE_NAME } from "./flashcardSlice";

const store = configureStore({
  reducer: {
    [FLASHCARD_SLICE_NAME]: flashcardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
