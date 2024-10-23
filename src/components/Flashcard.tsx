"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Save, Edit, Check } from "lucide-react";

import { ConfirmDialog } from "@/components/ConfirmDialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { languages } from "@/types/types";
import { useFlashcardHandler } from "@/hooks/useFlashcardHandler";

import { Volume2 } from "lucide-react";

import type { FlashcardType } from "@/types/types";

import { Input } from "@/components/ui/input";

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

  /**
   * テキストを音声で読み上げる関数
   * @param text 読み上げるテキスト
   * @param lang 言語コード
   */
  const handleTextToSpeech = (text: string, lang: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "ja" ? "ja-JP" : "en-US";
    window.speechSynthesis.speak(utterance);
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
        <Volume2 className="h-4 w-4 text-blue-600" />
        <span className="sr-only">Listen to source text</span>
      </Button>
    </div>
  );
};

export const Flashcard = ({
  flashcardHandler,
}: {
  flashcardHandler: ReturnType<typeof useFlashcardHandler>;
}) => {
  const {
    flashcards,
    handleSaveTranslation,
    handleDeleteTranslation,
    handleEditTranslation,
    handleCancelEdit,
  } = flashcardHandler;

  return (
    <AnimatePresence>
      {flashcards.map((item, index) => (
        <motion.div
          key={item.timestamp}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* 各翻訳履歴のカード */}
          <Card className="mb-2 hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex justify-between items-start mb-1">
                {/* 翻訳元の言語表示 */}
                <span className="text-sm font-medium text-gray-500">
                  {languages[item.sourceLang]}
                </span>
                <div className="flex space-x-1">
                  {/* 翻訳の保存ボタン */}
                  <ConfirmDialog title="Save to vocabulary?" ok="Save">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSaveTranslation(index)}
                      disabled={item.editing ? false : item.saved}
                    >
                      <AnimatePresence mode="wait">
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
                            <Save className="h-4 w-4 text-blue-600" />
                          ) : item.saved ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Save className="h-4 w-4 text-blue-600" />
                          )}
                        </motion.div>
                      </AnimatePresence>
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
                  {!item.editing ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTranslation(index)}
                    >
                      <Edit className="h-4 w-4 text-green-600" />
                      <span className="sr-only">Edit translation</span>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelEdit()}
                    >
                      <RotateCcw className="h-4 w-4 text-green-600" />
                      <span className="sr-only">Cancel edit</span>
                    </Button>
                  )}
                  {/* 翻訳の削除ボタン */}
                  <ConfirmDialog title="Delete this?" ok="OK">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTranslation(index)}
                    >
                      <X className="h-4 w-4 text-red-600" />
                      <span className="sr-only">Delete translation</span>
                    </Button>
                  </ConfirmDialog>
                </div>
              </div>
              {/* 翻訳元テキストの表示または編集 */}
              <EditableText
                io="input"
                item={item}
                lang={item.sourceLang}
                flashcardHandler={flashcardHandler}
              />
              <div className="flex justify-between items-start mb-1">
                {/* 翻訳先の言語表示 */}
                <span className="text-sm font-medium text-gray-500">
                  {languages[item.targetLang]}
                </span>
              </div>
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
    </AnimatePresence>
  );
};
