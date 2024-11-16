import type { ReactNode } from "react";
import React, { createContext, useContext } from "react";

import { useFlashcardHandler } from "@/hooks/useFlashcardHandler";

// Start Generation Here

// Flashcardコンテキストの型定義
interface FlashcardContextType {
  flashcardHandler: ReturnType<typeof useFlashcardHandler>;
}

// Flashcardコンテキストの作成
const FlashcardContext = createContext<FlashcardContextType | undefined>(
  undefined
);

// FlashcardProviderコンポーネント
export const FlashcardProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const flashcardHandler = useFlashcardHandler();

  return (
    <FlashcardContext.Provider value={{ flashcardHandler }}>
      {children}
    </FlashcardContext.Provider>
  );
};

export const useFlashcardContextHandler = () => {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error("useFlashcard must be used within a FlashcardProvider");
  }
  return { ...context.flashcardHandler };
};
