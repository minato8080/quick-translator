"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Save, Edit, Check, Eye, EyeOff } from "lucide-react";

import { ConfirmDialog } from "@/components/ConfirmDialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { languages } from "@/types/types";
import { useFlashcardHandler } from "@/hooks/useFlashcardHandler";

import { Volume2 } from "lucide-react";

import type { FlashcardType } from "@/types/types";

import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Switch } from "./ui/switch";
import { format } from "date-fns";

/**
 * EditableTextコンポーネント
 *
 * このコンポーネントは、翻訳テキストを表示または編集するためのUIを提供します。
 *
 * @param io - テキストの種類（"input"または"output"）
 * @param item - 表示または編集するWordCardオブジェクト
 * @param index - WordCardのインデックス
 * @param lang - 言語コード
 * @param setFlashcards - 翻訳履歴を更新するための関数
 *
 * @returns 翻訳テキストの表示または編集UI
 */
const EditableText = ({
  io,
  item,
  lang,
  flashcardHandler,
}: {
  io: "input" | "output";
  item: FlashcardType;
  lang: string;
  flashcardHandler: ReturnType<typeof useFlashcardHandler>;
}) => {
  const { editingText, setEditingText } = flashcardHandler;
  const [isSpeaking, setIsSpeaking] = useState(false);

  /**
   * テキストを音声で読み上げる関数
   * @param text 読み上げるテキスト
   * @param lang 言語コード
   */
  const handleTextToSpeech = (text: string, lang: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "ja" ? "ja-JP" : "en-US";
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
  };

  return (
    <div className="flex justify-between items-center mb-2">
      {/* 翻訳元テキストの表示または編集 */}
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
        <p className="text-gray-800 p-2">{item[io]}</p>
      )}
      {/* 翻訳元テキストの音声再生ボタン */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleTextToSpeech(item[io], lang)}
      >
        <Volume2 className={`h-4 w-4 text-blue-${isSpeaking ? 600 : 400}`} />
        <span className="sr-only">Listen to source text</span>
      </Button>
    </div>
  );
};

const CardCore = ({
  flashcardHandler,
  items,
  startIndex = 0,
  isLearningMode,
}: {
  flashcardHandler: ReturnType<typeof useFlashcardHandler>;
  items: FlashcardType[];
  startIndex?: number;
  isLearningMode: boolean;
}) => {
  const {
    setFlashcards,
    handleSaveTranslation,
    handleDeleteTranslation,
    handleEditTranslation,
    handleCancelEdit,
  } = flashcardHandler;
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
              <EditableText
                io="input"
                item={item}
                lang={item.sourceLang}
                flashcardHandler={flashcardHandler}
              />
              {/* 翻訳先テキストの表示または編集 */}
              <EditableText
                io="output"
                item={item}
                lang={item.targetLang}
                flashcardHandler={flashcardHandler}
              />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </>
  );
};

export const Flashcard = ({
  flashcardHandler,
  isGroupedView,
  isLearningMode = false,
}: {
  flashcardHandler: ReturnType<typeof useFlashcardHandler>;
  isGroupedView: boolean;
  isLearningMode?: boolean;
}) => {
  const { flashcards } = flashcardHandler;
  const [groupedHistory, setGroupedHistory] = useState<
    Record<string, typeof flashcards>
  >({});

  useEffect(() => {
    if (isGroupedView) {
      const newGroupedHistory = flashcards.reduce((acc, item) => {
        const date = format(new Date(item.timestamp),"yyyy/MM/dd");
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
              />
            </motion.div>
          )))()
      ) : (
        <CardCore
          items={flashcards}
          flashcardHandler={flashcardHandler}
          isLearningMode={isLearningMode}
        />
      )}
    </AnimatePresence>
  );
};
