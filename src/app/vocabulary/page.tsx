"use client";

import { Header } from "@/components/Header";
import { Flashcard } from "@/components/Flashcard";
import { useFlashcardHandler } from "@/hooks/useFlashcardHandler";

export default function Translate() {
  const flashcardHandler = useFlashcardHandler();

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center p-4">
      {/* メインのカードコンテナ */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden fixed">
        {/* ヘッダー部分 */}
        <Header />
        {/* メインコンテンツ部分 */}
        <div className="p-4 overflow-y-auto">
          {/* 翻訳履歴の表示 */}
          <Flashcard flashcardHandler={flashcardHandler} />
        </div>
      </div>
    </div>
  );
}
