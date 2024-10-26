"use client";

import { useEffect, useState } from "react";

import { useLiveQuery } from "dexie-react-hooks";

import { Header } from "@/components/Header";
import { Flashcard } from "@/components/Flashcard";
import { Switch } from "@/components/ui/switch";
import { useFlashcardHandler } from "@/hooks/useFlashcardHandler";
import { db } from "@/global/dexieDB";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/DatePicker";
import { Book, Edit, Eye, EyeOff, Search } from "lucide-react";

export default function Vocabulary() {
  const flashcardHandler = useFlashcardHandler("vocabulary");
  const [isLearningMode, setIsLearningMode] = useState(true);
  const [isTextAreaVisible, setIsTextAreaVisible] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString()
  );
  const [conditionDate, setConditionDate] = useState(
    new Date().getFullYear().toString()
  );
  const { setFlashcards } = flashcardHandler;
  const vocabulary = useLiveQuery(async () => {
    return await db.vocabulary
      ?.where("timestamp")
      .startsWith(conditionDate)
      .sortBy("timestamp")
      .then((res) => res.reverse());
  }, [conditionDate]);
  const calendar = useLiveQuery(async () => {
    return await db.calendar?.toArray();
  });

  useEffect(() => {
    setFlashcards(
      vocabulary
        ? vocabulary.map((item) => ({
            ...item,
            saved: true,
            editing: false,
            visible: true,
          }))
        : []
    );
  }, [vocabulary]);

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center">
      {/* メインのカードコンテナ */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden fixed">
        {/* ヘッダー部分 */}
        <Header english="Vocabulary" japanese="単語帳" />
        {/* メインコンテンツ部分 */}
        <div>
          <div className="flex justify-between items-center mb-2 m-1">
            <div className="flex">
              {/* 検索ボタン */}
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-gray-400 ml-2"
                onClick={() => {
                  setConditionDate(selectedDate);
                }}
              >
                <Search className="h-4 w-4" />
              </Button>
              {/* 日付選択コンポーネント */}
              <DatePicker setDate={setSelectedDate} calendar={calendar} />
            </div>
            <div className="flex space-x-4 ml-auto">
              <div className="flex items-center space-x-2">
                {/* 学習モードのアイコン表示 */}
                {isLearningMode ? (
                  <Book className="h-4 w-4" />
                ) : (
                  <Edit className="h-4 w-4" />
                )}
                {/* 学習モードの切り替えスイッチ */}
                <Switch
                  id="learning-mode"
                  checked={isLearningMode}
                  onCheckedChange={setIsLearningMode}
                />
              </div>
              <div className="flex items-center space-x-2">
                {/* テキストエリアの表示/非表示アイコン */}
                {isTextAreaVisible ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
                {/* テキストエリアの表示/非表示切り替えスイッチ */}
                <Switch
                  id="text-area-toggle"
                  disabled={!isLearningMode}
                  checked={isTextAreaVisible}
                  onCheckedChange={(checked) => {
                    setIsTextAreaVisible(checked);
                    setFlashcards((prev) =>
                      prev.map((flashcard) => {
                        return { ...flashcard, visible: checked };
                      })
                    );
                  }}
                />
              </div>
            </div>
          </div>
          <div className="h-px bg-gray-300 flex-grow" />
        </div>
        <div
          className="p-2 pt-0 overflow-y-auto"
          style={{ height: "calc(100vh - 56px - 45px)" }}
        >
          {/* 翻訳履歴の表示 */}
          <Flashcard
            flashcardHandler={flashcardHandler}
            isGroupedView={true}
            isLearningMode={isLearningMode}
          />
        </div>
      </div>
    </div>
  );
}
