"use client";

import { useEffect } from "react";

import { useLiveQuery } from "dexie-react-hooks";

import { Header } from "@/components/Header";
import { Flashcard } from "@/components/Flashcard";
import { useFlashcardHandler } from "@/hooks/useFlashcardHandler";
import { db } from "@/global/dexieDB";

export default function Vocabulary() {
  const flashcardHandler = useFlashcardHandler();
  const { setFlashcards } = flashcardHandler;
  const vocabulary = useLiveQuery(async () => {
    return await db.vocabulary.orderBy("timestamp").reverse().toArray();
  });

  useEffect(() => {
    setFlashcards(
      vocabulary
        ? vocabulary.map((item) => ({ ...item, saved: true, editing: false }))
        : []
    );
  }, [vocabulary]);

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center p-4">
      {/* メインのカードコンテナ */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden fixed">
        {/* ヘッダー部分 */}
        <Header english="Vocabulary" japanese="単語帳" />
        {/* メインコンテンツ部分 */}
        <div
          className="p-4 overflow-y-auto"
          style={{ height: "calc(100vh - 68px - 25px)" }}
        >
          {/* 翻訳履歴の表示 */}
          <Flashcard flashcardHandler={flashcardHandler} />
        </div>
      </div>
    </div>
  );
}
