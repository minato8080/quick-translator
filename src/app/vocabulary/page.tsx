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
import { Book, Edit, Eye, EyeOff, Search, SquareX } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TriStateToggle } from "@/components/TriStateToggle";
import { LEARNING_MODES, LearningMode } from "@/types/types";


export default function Vocabulary() {
  const flashcardHandler = useFlashcardHandler("vocabulary");
  const [isLearningMode, setIsLearningMode] = useState(true);
  const [isTextAreaVisible, setIsTextAreaVisible] = useState(true);
  const [learningMode, setLearningMode] = useState<LearningMode>("origin");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString()
  );
  const [conditionDate, setConditionDate] = useState(
    new Date().getFullYear().toString()
  );
  const { setFlashcards, handleCancelEdit, handleDeleteAllTranslations } =
    flashcardHandler;
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
              {/* 日付選択コンポーネント */}
              <DatePicker setDate={setSelectedDate} calendar={calendar} />
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
            </div>
            <div className="flex ml-auto">
              {/* 翻訳の削除ボタン */}
              {!isLearningMode ? (
                <ConfirmDialog
                  title="Delete all displayed cards?"
                  description="Are you sure you want to delete all the cards currently displayed?"
                  ok="OK"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAllTranslations(conditionDate)}
                  >
                    <SquareX className="h-4 w-4 text-pink-600" />
                    <span className="sr-only">Delete translation</span>
                  </Button>
                </ConfirmDialog>
              ) : null}
              <div className="flex space-x-4 ml-auto">
                <div className="flex items-center space-x-2">
                  {/* 学習モードのアイコン表示 */}
                  {isLearningMode ? (
                    <Book className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Edit className="h-4 w-4 text-teal-600" />
                  )}
                  {/* 学習モードの切り替えスイッチ */}
                  <Switch
                    id="learning-mode"
                    checked={isLearningMode}
                    onCheckedChange={(value) => {
                      handleCancelEdit();
                      setIsLearningMode(value);
                    }}
                    className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-teal-600"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  {/* テキストエリアの表示/非表示アイコン */}
                  {isTextAreaVisible ? (
                    <Eye
                      className={`h-4 w-4 text-blue-${
                        isLearningMode ? "600" : "400"
                      }`}
                    />
                  ) : (
                    <EyeOff className="h-4 w-4 text-blue-600" />
                  )}
                  {/* テキストエリアの表示/非表示切り替えスイッチ */}
                  <Switch
                    id="text-area-toggle"
                    disabled={!isLearningMode}
                    checked={isTextAreaVisible}
                    className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-blue-400"
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
                <TriStateToggle
                  value={!isLearningMode ? "origin" : learningMode}
                  onChange={setLearningMode}
                  options={LEARNING_MODES}
                  disabled={!isLearningMode}
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
            learningMode={learningMode}
          />
        </div>
      </div>
    </div>
  );
}
