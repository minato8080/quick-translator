"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Save, Edit, Check, Eye, EyeOff } from "lucide-react";

import { ConfirmDialog } from "@/components/ConfirmDialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { languages } from "@/types/types";
import { useFlashcardHandler } from "@/hooks/useFlashcardHandler";

import { Volume2 } from "lucide-react";

import type { FlashcardType, LearningMode } from "@/types/types";

import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Switch } from "./ui/switch";
import { format } from "date-fns";

type IOType = "input" | "output";

/**
 * スピーカーボタンコンポーネント
 * @param io - 入力または出力のタイプ
 * @param item - フラッシュカードのアイテム
 * @param lang - 言語コード
 */
const SpeakerButton = ({
  io,
  item,
  lang,
}: {
  io: IOType;
  item: FlashcardType;
  lang: string;
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  /**
   * テキストを音声合成で再生する
   * @param text - 再生するテキスト
   * @param lang - 言語コード
   */
  const handleTextToSpeech = (text: string, lang: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "ja" ? "ja-JP" : "en-US";
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleTextToSpeech(item[io], lang)}
    >
      <Volume2 className={`h-4 w-4 text-blue-${isSpeaking ? 600 : 400}`} />
      <span className="sr-only">Listen to source text</span>
    </Button>
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
  const { editingText, setEditingText } = flashcardHandler;
  const {
    setFlashcards,
    handleSaveTranslation,
    handleDeleteTranslation,
    handleEditTranslation,
    handleCancelEdit,
  } = flashcardHandler;

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
  const EditableText = ({ io, item }: { io: IOType; item: FlashcardType }) => {
    return (
      <>
        {item.editing ? (
          <Input
            value={editingText ? editingText[io] : ""}
            onChange={(e) =>
              setEditingText((prev) =>
                prev ? { ...prev, [io]: e.target.value } : null
              )
            }
            className="flex-grow p-2 text-md"
          />
        ) : (
          <p
            className={`${
              !isLearningMode
                ? "text-gray-800"
                : switchIO(learningMode, item, io) === "output" && !item.visible
                ? "text-transparent"
                : "text-gray-800"
            } p-2`}
          >
            {item[io]}
          </p>
        )}
      </>
    );
  };

  return (
    <>
      {items.map((item, lindex) => (
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
                              handleSaveTranslation(startIndex + lindex)
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
                              : handleEditTranslation(startIndex + lindex)
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
                              handleDeleteTranslation(startIndex + lindex)
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
                />
                <SpeakerButton
                  io={switchIO(learningMode, item, "input")}
                  item={item}
                  lang={switchSpeaker(learningMode, item, "input")}
                />
              </div>
              {/* 翻訳先テキストの表示または編集 */}
              <div className="flex justify-between items-center mb-2">
                <EditableText
                  io={switchIO(learningMode, item, "output")}
                  item={item}
                />
                <SpeakerButton
                  io={switchIO(learningMode, item, "output")}
                  item={item}
                  lang={switchSpeaker(learningMode, item, "output")}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
export const Flashcard = ({
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
    Record<string, typeof flashcards>
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
                <h3 className="text-md font-semibold text-gray-500">{date}</h3>
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
};
