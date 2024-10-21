"use client";

import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Save, Edit, Check } from "lucide-react";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EditableText } from "@/components/EditableText";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { languages } from "@/types/types";
import { useFlashcardHandler } from "@/hooks/useFlashcardHandler";

export const Flashcard = ({
  flashcardHandler,
}: {
  flashcardHandler: ReturnType<typeof useFlashcardHandler>;
}) => {
  const {
    flashcards,
    setFlashcards,
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
                      disabled={item.saved}
                    >
                      {item.editing ? (
                        <Save className="h-4 w-4 text-blue-600" />
                      ) : item.saved ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Save className="h-4 w-4 text-blue-600" />
                      )}
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
                      onClick={() => handleCancelEdit(index)}
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
                index={index}
                lang={item.sourceLang}
                setFlashcards={setFlashcards}
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
                index={index}
                lang={item.targetLang}
                setFlashcards={setFlashcards}
              />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </AnimatePresence>
  );
};
