"use client";

import { useState } from "react";

import { format } from "date-fns";
import { useLiveQuery } from "dexie-react-hooks";
import { Book, Edit, Eye, EyeOff, SquareX } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import type { FLASHCARD_SLICE_NAME } from "@/global/flashcardSlice";
import type { AppDispatch, RootState } from "@/global/store";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DateSearchBox } from "@/components/DatePicker";
import { Flashcard } from "@/components/Flashcard";
import { Header } from "@/components/Header";
import { TriStateToggle } from "@/components/TriStateToggle";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { db } from "@/global/dexieDB";
import {
  changeFlashcard,
  changeLearningMode,
  toggleLearningMode,
  toggleVisibleParent,
} from "@/global/flashcardSlice";
import { useFlashcardHandler } from "@/hooks/useFlashcardHandler";
import { FORMAT, LEARNING_MODES } from "@/types/types";

const ControlArea = ({
  flashcardHandler,
}: {
  flashcardHandler: ReturnType<typeof useFlashcardHandler>;
}) => {
  const { handleDeleteAllTranslations } = flashcardHandler;
  const [conditionDate, setConditionDate] = useState(
    format(new Date(), FORMAT.DATE)
  );
  const { learningMode, isLearningMode, isVisibleParent } = useSelector<
    RootState,
    RootState[typeof FLASHCARD_SLICE_NAME]
  >((state) => state.flashcard);
  const dispatch = useDispatch<AppDispatch>();

  useLiveQuery(async () => {
    const result = await db.vocabulary
      ?.where("timestamp")
      .startsWith(conditionDate)
      .sortBy("timestamp")
      .then((res) => res.reverse());
    dispatch(changeFlashcard(result));
  }, [conditionDate]);
  return (
    <div>
      <div className="flex flex-wrap justify-between items-center m-1">
        <DateSearchBox setConditionDate={setConditionDate} />
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
                onCheckedChange={() => {
                  dispatch(toggleLearningMode());
                }}
                className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-teal-600"
              />
            </div>
            <div className="flex items-center space-x-2">
              {/* テキストエリアの表示/非表示アイコン */}
              {isVisibleParent ? (
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
                checked={isVisibleParent}
                className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-blue-400"
                onCheckedChange={() => {
                  dispatch(toggleVisibleParent());
                }}
              />
            </div>
            <TriStateToggle
              value={!isLearningMode ? "origin" : learningMode}
              options={LEARNING_MODES}
              onChange={(e) => dispatch(changeLearningMode(e))}
              disabled={!isLearningMode}
            />
          </div>
        </div>
      </div>
      <div className="h-px bg-gray-300 flex-grow" />
    </div>
  );
};

/**
 * ボキャブラリーページコンポーネント
 * ユーザーが保存したボキャブラリーを表示し、管理するためのページ
 * @returns ボキャブラリーページのReactコンポーネント
 */
export default function Vocabulary() {
  const flashcardHandler = useFlashcardHandler("vocabulary");

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center">
      {/* メインのカードコンテナ */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden fixed">
        {/* ヘッダー部分 */}
        <Header english="Vocabulary" japanese="単語帳" />
        {/* コントローラ部分 */}
        <ControlArea flashcardHandler={flashcardHandler} />
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
          <Flashcard flashcardHandler={flashcardHandler} isGroupedView={true} />
          {/* <Flashcard isGroupedView={true} /> */}
        </div>
      </div>
    </div>
  );
}
