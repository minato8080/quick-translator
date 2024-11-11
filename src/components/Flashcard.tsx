"use client";

import type { SetStateAction } from "react";
import { useEffect, useState } from "react";
import React from "react";

import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Save, Edit, Check, Eye, EyeOff } from "lucide-react";
import { Volume2 } from "lucide-react";

import { Switch } from "./ui/switch";

import type { useFlashcardHandler } from "@/hooks/useFlashcardHandler";
import type { FlashcardType, LearningMode } from "@/types/types";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { languages } from "@/types/types";

type IOType = "input" | "output";

/**
 * テキストを音声合成で再生する
 * @param text - 再生するテキスト
 * @param lang - 言語コード
 */
const handleTextToSpeech = (
  text: string,
  lang: string,
  setIsSpeaking: React.Dispatch<SetStateAction<boolean>>
) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === "ja" ? "ja-JP" : "en-US";
  window.speechSynthesis.speak(utterance);
  setIsSpeaking(true);
  utterance.onend = () => setIsSpeaking(false);
};

/**
 * スピーカーボタンコンポーネント
 * @param io - 入力または出力のタイプ
 * @param item - フラッシュカードのアイテム
 * @param lang - 言語コード
 */
const SpeakerButton = ({ text, lang }: { text: string; lang: string }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleTextToSpeech(text, lang, setIsSpeaking)}
    >
      <Volume2 className={`h-4 w-4 text-blue-${isSpeaking ? 600 : 400}`} />
      <span className="sr-only">Listen to source text</span>
    </Button>
  );
};

/**
 * 入力または出力のタイプを切り替える
 * @param learningMode - 学習モードのタイプ
 * @param item - フラッシュカードのアイテム
 * @param io - 入力または出力のタイプ
 * @returns IOType
 */
const switchIO = (
  learningMode: LearningMode,
  item: FlashcardType,
  io: IOType
): IOType => {
  switch (learningMode) {
    case "origin":
      return io;
    case "en-ja":
      return (item.sourceLang === "en") === (io === "input")
        ? "input"
        : "output";
    case "ja-en":
      return (item.targetLang === "en") === (io === "input")
        ? "input"
        : "output";
    default:
      return "input";
  }
};

/**
 * スピーカーの言語を切り替える
 * @param learningMode - 学習モードのタイプ
 * @param item - フラッシュカードのアイテム
 * @param io - 入力または出力のタイプ
 * @returns string
 */
const switchSpeaker = (
  learningMode: LearningMode,
  item: FlashcardType,
  io: IOType
) => {
  switch (learningMode) {
    case "origin":
      return io === "input" ? item.sourceLang : item.targetLang;
    case "en-ja":
      return io === "input" ? "en" : "ja";
    case "ja-en":
      return io === "output" ? "en" : "ja";
    default:
      return "";
  }
};

/**
 * 編集可能なテキストコンポーネント
 * @param io - 入力または出力のタイプ
 * @param item - フラッシュカードのアイテム
 */
const EditableText = ({
  io,
  item,
  editingText,
  setEditingText,
  isLearningMode,
  learningMode,
}: {
  io: IOType;
  item: FlashcardType;
  editingText: FlashcardType | null;
  setEditingText: React.Dispatch<
    SetStateAction<
      | (FlashcardType & {
          index: number;
        })
      | null
    >
  >;
  isLearningMode: boolean;
  learningMode: LearningMode;
}) => {
  return (
    <>
      {item.editing ? (
        <textarea
          value={editingText ? editingText[io] : ""}
          onChange={(e) =>
            setEditingText((prev) =>
              prev ? { ...prev, [io]: e.target.value } : null
            )
          }
          className="textarea field-sizing-content"
        />
      ) : (
        <textarea
          className={`${
            !isLearningMode
              ? "text-gray-800"
              : switchIO(learningMode, item, io) === "output" && !item.visible
              ? "text-transparent"
              : "text-gray-800"
          } textarea field-sizing-content bg-white border-white`}
          disabled={true}
          value={item[isLearningMode ? io : switchIO(learningMode, item, io)]}
        />
      )}
    </>
  );
};

/**
 * カード本体コンポーネント
 * @param flashcardHandler - フラッシュカードのハンドラー
 * @param items - フラッシュカードのアイテムリスト
 * @param startIndex - 開始インデックス
 * @param isLearningMode - 学習モードかどうか
 * @param learningMode - 学習モードのタイプ
 */
const CardLeef = ({
  flashcardHandler,
  item,
  startIndex = 0,
  divisionIndex,
  isLearningMode,
  learningMode,
}: {
  flashcardHandler: ReturnType<typeof useFlashcardHandler>;
  item: FlashcardType;
  startIndex?: number;
  divisionIndex: number;
  isLearningMode: boolean;
  learningMode: LearningMode;
}) => {
  const {
    editingText,
    setEditingText,
    setFlashcards,
    handleSaveTranslation,
    handleDeleteTranslation,
    handleEditTranslation,
    handleCancelEdit,
  } = flashcardHandler;

  return (
    <motion.div
      key={item.timestamp}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* 各翻訳履歴のカード */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="p-3 h-10">
          <AnimatePresence mode="wait">
            <div className="flex justify-between items-start mb-1">
              {/* 翻訳元の言語表示 */}
              <span className="text-[12px] font-medium text-gray-400">
                {languages[item.sourceLang]} → {languages[item.targetLang]}
              </span>
              {/* ボタンを配置する場所*/}
              <div className="flex space-x-1">
                {isLearningMode ? (
                  <motion.div
                    key={
                      item.editing
                        ? "editing"
                        : item.saved
                        ? "saved"
                        : "unsaved"
                    }
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center space-x-2 h-4">
                      {item.visible ? (
                        <Eye className="h-4 w-4 text-blue-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-blue-400" />
                      )}
                      <Switch
                        id="text-area-toggle"
                        checked={item.visible}
                        onCheckedChange={(checked) => {
                          setFlashcards((prev) =>
                            prev.map((flashcard) =>
                              flashcard.timestamp === item.timestamp
                                ? { ...flashcard, visible: checked }
                                : flashcard
                            )
                          );
                        }}
                        className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-blue-400"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex items-center space-x-2 h-4">
                    <ConfirmDialog title="Save to vocabulary?" ok="Save">
                      {/* 保存ボタン */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleSaveTranslation(startIndex + divisionIndex)
                        }
                        disabled={item.editing ? false : item.saved}
                      >
                        <motion.div
                          key={
                            item.editing
                              ? "unsaved"
                              : item.saved
                              ? "saved"
                              : "unsaved"
                          }
                          initial={{ opacity: 0, rotate: -180 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: 180 }}
                          transition={{ duration: 0.3 }}
                        >
                          {item.editing ? (
                            <Save className="h-4 w-4 text-blue-600" />
                          ) : item.saved ? (
                            <Check className="h-4 w-4 text-blue-400" />
                          ) : (
                            <Save className="h-4 w-4 text-blue-600" />
                          )}
                        </motion.div>
                        <span className="sr-only">
                          {item.editing
                            ? "Save changes"
                            : item.saved
                            ? "Saved"
                            : "Save translation"}
                        </span>
                      </Button>
                    </ConfirmDialog>
                    {/* 編集ボタン */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        item.editing
                          ? handleCancelEdit()
                          : handleEditTranslation(startIndex + divisionIndex)
                      }
                    >
                      <motion.div
                        key={
                          item.editing
                            ? "editing"
                            : item.saved
                            ? "saved"
                            : "unsaved"
                        }
                        initial={{ opacity: 0, rotate: -180 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        {item.editing ? (
                          <RotateCcw className="h-4 w-4 text-teal-600" />
                        ) : (
                          <Edit className="h-4 w-4 text-teal-600" />
                        )}
                      </motion.div>
                      <span className="sr-only">
                        {item.editing ? "Cancel edit" : "Edit translation"}
                      </span>
                    </Button>
                    {/* 翻訳の削除ボタン */}
                    <ConfirmDialog title="Delete this?" ok="OK">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeleteTranslation(startIndex + divisionIndex)
                        }
                      >
                        <X className="h-4 w-4 text-pink-600" />
                        <span className="sr-only">Delete translation</span>
                      </Button>
                    </ConfirmDialog>
                  </div>
                )}
              </div>
            </div>
          </AnimatePresence>
        </CardHeader>
        <CardContent className="p-1">
          {/* 翻訳元テキストの表示または編集 */}
          <div className="flex justify-between items-center mb-2">
            <EditableText
              io={switchIO(learningMode, item, "input")}
              item={item}
              editingText={editingText}
              setEditingText={setEditingText}
              isLearningMode={isLearningMode}
              learningMode={learningMode}
            />
            <SpeakerButton
              text={item[switchIO(learningMode, item, "input")]}
              lang={switchSpeaker(learningMode, item, "input")}
            />
          </div>
          {/* 翻訳先テキストの表示または編集 */}
          <div className="flex justify-between items-center mb-1">
            <EditableText
              io={switchIO(learningMode, item, "output")}
              item={item}
              editingText={editingText}
              setEditingText={setEditingText}
              isLearningMode={isLearningMode}
              learningMode={learningMode}
            />
            <SpeakerButton
              text={item[switchIO(learningMode, item, "output")]}
              lang={switchSpeaker(learningMode, item, "output")}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * カード本体コンポーネント
 * @param flashcardHandler - フラッシュカードのハンドラー
 * @param items - フラッシュカードのアイテムリスト
 * @param startIndex - 開始インデックス
 * @param isLearningMode - 学習モードかどうか
 * @param learningMode - 学習モードのタイプ
 */
const CardCore = ({
  flashcardHandler,
  items,
  startIndex = 0,
  isLearningMode,
  learningMode,
}: {
  flashcardHandler: ReturnType<typeof useFlashcardHandler>;
  items: FlashcardType[];
  startIndex?: number;
  isLearningMode: boolean;
  learningMode: LearningMode;
}) => {
  return (
    <>
      {items.map((item, divisionIndex) => (
        <CardLeef
          key={startIndex + divisionIndex}
          startIndex={startIndex}
          divisionIndex={divisionIndex}
          flashcardHandler={flashcardHandler}
          item={item}
          isLearningMode={isLearningMode}
          learningMode={learningMode}
        />
      ))}
    </>
  );
};

/**
 * フラッシュカードコンポーネント
 * @param flashcardHandler - フラッシュカードのハンドラー
 * @param isGroupedView - グループ化されたビューかどうか
 * @param isLearningMode - 学習モードかどうか
 * @param learningMode - 学習モードのタイプ
 */
export const Flashcard = React.memo(
  ({
    flashcardHandler,
    isGroupedView,
    isLearningMode = false,
    learningMode,
  }: {
    flashcardHandler: ReturnType<typeof useFlashcardHandler>;
    isGroupedView: boolean;
    isLearningMode?: boolean;
    learningMode: LearningMode;
  }) => {
    const { flashcards } = flashcardHandler;
    const [groupedHistory, setGroupedHistory] = useState<
      Record<string, FlashcardType[]>
    >({});

    useEffect(() => {
      if (isGroupedView) {
        const newGroupedHistory = flashcards.reduce((acc, item) => {
          const date = format(new Date(item.timestamp), "yyyy/MM/dd");
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(item);
          return acc;
        }, {} as Record<string, typeof flashcards>);
        setGroupedHistory(newGroupedHistory);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flashcards]);

    return (
      <AnimatePresence>
        {isGroupedView ? (
          ((indexAdjuster = 0) =>
            Object.entries(groupedHistory).map(([date, items]) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-2 m-1">
                  <div className="h-px bg-gray-300 flex-grow" />
                  <h3 className="text-md font-semibold text-gray-500">
                    {date}
                  </h3>
                  <div className="h-px bg-gray-300 flex-grow" />
                </div>
                <CardCore
                  items={items}
                  flashcardHandler={flashcardHandler}
                  startIndex={(() => {
                    const index = indexAdjuster;
                    indexAdjuster += items.length;
                    return index;
                  })()}
                  isLearningMode={isLearningMode}
                  learningMode={learningMode}
                />
              </motion.div>
            )))()
        ) : (
          <CardCore
            items={flashcards}
            flashcardHandler={flashcardHandler}
            isLearningMode={isLearningMode}
            learningMode={learningMode}
          />
        )}
      </AnimatePresence>
    );
  }
);
Flashcard.displayName = "Flashcard";

export default Flashcard;
