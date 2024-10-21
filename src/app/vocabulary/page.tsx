"use client";

import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightLeft,
  X,
  RotateCcw,
  Save,
  Edit,
  Menu,
  Book,
  Settings,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EditableText } from "@/components/EditableText";

import type { WordCard } from "@/types/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { languages } from "@/types/types";
import { Header } from "@/components/Header";

export default function Translate() {
  const [preEditText, setPreEditText] = useState<WordCard>({
    input: "",
    output: "",
    sourceLang: "ja",
    targetLang: "en",
    saved: false,
    editing: false,
    timestamp: "",
  });
  const [translationHistory, setTranslationHistory] = useState<Array<WordCard>>(
    []
  );
  const [_activeScreen, setActiveScreen] = useState<
    "translate" | "vocabulary" | "settings"
  >("translate");
  const { toast } = useToast();
  const router = useRouter();

  /**
   * 翻訳を保存する関数
   * @param index 保存する翻訳のインデックス
   */
  const handleSaveTranslation = (index: number) => {
    setTranslationHistory((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, saved: true, editing: false } : item
      )
    );
    toast({
      title: "Translation Saved",
      description: "The translation has been saved to your vocabulary list.",
    });
  };

  /**
   * 翻訳を削除する関数
   * @param index 削除する翻訳のインデックス
   */
  const handleDeleteTranslation = (index: number) => {
    setTranslationHistory((prev) => prev.filter((_, i) => i !== index));
    toast({
      title: "Translation Deleted",
      description: "The translation has been removed from history.",
    });
  };

  /**
   * 翻訳を編集モードにする関数
   * @param index 編集する翻訳のインデックス
   */
  const handleEditTranslation = (index: number) => {
    setTranslationHistory((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          setPreEditText(item);
          return { ...item, editing: true, saved: false };
        } else {
          return item;
        }
      })
    );
  };

  /**
   * 編集をキャンセルする関数
   * @param index キャンセルする翻訳のインデックス
   */
  const handleCancelEdit = (index: number) => {
    setTranslationHistory((prev) =>
      prev.map((item, i) => (i === index ? { ...preEditText } : item))
    );
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center p-4">
      {/* メインのカードコンテナ */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden fixed">
        {/* ヘッダー部分 */}
        <Header />

        {/* メインコンテンツ部分 */}
        <div
          className="p-4 overflow-y-auto"
          style={{ height: "calc(100vh - 250px - 68px - 25px)" }}
        >
          {/* 翻訳履歴の表示 */}
          <AnimatePresence>
            {translationHistory.map((item, index) => (
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
                      setTranslationHistory={setTranslationHistory}
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
                      setTranslationHistory={setTranslationHistory}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
