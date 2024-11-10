"use client";

import { useState } from "react";

import { format } from "date-fns";
import { useLiveQuery } from "dexie-react-hooks";
import { Book, Edit, Eye, EyeOff, SquareX } from "lucide-react";

import type { LearningMode } from "@/types/types";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DateSearchBox } from "@/components/DatePicker";
import { Flashcard } from "@/components/Flashcard";
import { Header } from "@/components/Header";
import { TriStateToggle } from "@/components/TriStateToggle";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { db } from "@/global/dexieDB";
import { useFlashcardHandler } from "@/hooks/useFlashcardHandler";
import { FORMAT, LEARNING_MODES } from "@/types/types";

/**
 * ボキャブラリーページコンポーネント
 * ユーザーが保存したボキャブラリーを表示し、管理するためのページ
 * @returns ボキャブラリーページのReactコンポーネント
 */
export default function Vocabulary() {
  const flashcardHandler = useFlashcardHandler("vocabulary");
  const [isLearningMode, setIsLearningMode] = useState(true);
  const [isTextAreaVisible, setIsTextAreaVisible] = useState(true);
  const [learningMode, setLearningMode] = useState<LearningMode>("origin");
  const [conditionDate, setConditionDate] = useState(
    format(new Date(), FORMAT.DATE)
  );
  const { setFlashcards, handleCancelEdit, handleDeleteAllTranslations } =
    flashcardHandler;

  useLiveQuery(async () => {
    const result = await db.vocabulary
      ?.where("timestamp")
      .startsWith(conditionDate)
      .sortBy("timestamp")
      .then((res) => res.reverse());

    setFlashcards(
      result.map((item) => ({
        ...item,
        saved: true,
        editing: false,
        visible: true,
      }))
    );

    return result;
  }, [conditionDate]);


  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center">
      {/* メインのカードコンテナ */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden fixed">
        {/* ヘッダー部分 */}
        <Header english="Vocabulary" japanese="単語帳" />
        {/* メインコンテンツ部分 */}
        <div>
          <div className="flex flex-wrap justify-between items-center m-1">
            <DateSearchBox setConditionDate={setConditionDate}/>
            <div className="flex ml-auto mb-2">
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
          style={{
            maxHeight: `calc(100vh - 56px - ${
              typeof window !== "undefined" && window.innerWidth > 603
                ? 65
                : 104
            }px)`,
          }}
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
