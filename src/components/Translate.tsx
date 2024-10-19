"use client";

import { useState, useEffect, useCallback } from "react";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightLeft,
  Loader2,
  X,
  RotateCcw,
  Save,
  Edit,
  Menu,
  Book,
  Settings,
  Check,
} from "lucide-react";

import { ConfirmDialog } from "./ConfirmDialog";
import { EditableText } from "./EditableText";

import type { LanguagesKeys, WordCard } from "@/types/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { languages } from "@/types/types";

/**
 * 擬似的な翻訳関数
 * @param text 翻訳するテキスト
 * @param _sourceLang ソース言語
 * @param _targetLang ターゲット言語
 * @returns 翻訳されたテキスト
 */
const translateText = async (
  text: string,
  _sourceLang: string,
  _targetLang: string
): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // API遅延をシミュレート
  return text;
};

export default function Translate() {
  const [inputText, setInputText] = useState("");
  const [preEditText, setPreEditText] = useState<WordCard>({
    input: "",
    output: "",
    sourceLang: "ja",
    targetLang: "en",
    saved: false,
    editing: false,
    timestamp: "",
  });
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState<LanguagesKeys>("ja");
  const [targetLang, setTargetLang] = useState<LanguagesKeys>("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationHistory, setTranslationHistory] = useState<Array<WordCard>>(
    []
  );
  const [_activeScreen, setActiveScreen] = useState<
    "translate" | "vocabulary" | "settings"
  >("translate");
  const { toast } = useToast();

  /**
   * 翻訳を実行する関数
   */
  const handleTranslation = useCallback(async () => {
    if (inputText) {
      setIsTranslating(true);
      try {
        const result = await translateText(inputText, sourceLang, targetLang);
        setTranslatedText(result);
      } catch {
        toast({
          title: "Translation Error",
          description:
            "An error occurred during translation. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsTranslating(false);
      }
    } else {
      setTranslatedText("");
    }
  }, [inputText, sourceLang, targetLang, toast]);

  /**
   * 入力テキストが変更されたときに翻訳をトリガーする
   */
  useEffect(() => {
    const translateTimeout = setTimeout(() => {
      handleTranslation();
    }, 300);

    return () => clearTimeout(translateTimeout);
  }, [handleTranslation]);

  /**
   * ソース言語とターゲット言語を入れ替える関数
   */
  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translatedText);
    setTranslatedText("");
  };

  /**
   * 翻訳履歴に追加する関数
   */
  const handleAddToHistory = () => {
    if (inputText && translatedText && !isTranslating) {
      setTranslationHistory((prev) => [
        {
          input: inputText,
          output: translatedText,
          sourceLang: sourceLang,
          targetLang: targetLang,
          saved: false,
          editing: false,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
      setInputText("");
      setTranslatedText("");
    }
  };

  /**
   * Enterキーが押されたときに履歴に追加する関数
   * @param e キーボードイベント
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddToHistory();
    }
  };

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
    // 全体のコンテナを定義
    <div className="min-h-screen bg-blue-50 flex flex-col items-center p-4">
      {/* メインのカードコンテナ */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden fixed">
        {/* ヘッダー部分 */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          {/* アプリケーションのタイトル */}
          <h1 className="text-2xl font-bold">Quick Translator</h1>
          <div className="flex items-center space-x-2">
            {/* ドロップダウンメニュー */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-blue-700"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* 翻訳画面への切り替え */}
                <DropdownMenuItem onClick={() => setActiveScreen("translate")}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  <span>Translate</span>
                </DropdownMenuItem>
                {/* ボキャブラリー画面への切り替え */}
                <DropdownMenuItem onClick={() => setActiveScreen("vocabulary")}>
                  <Book className="mr-2 h-4 w-4" />
                  <span>Vocabulary</span>
                </DropdownMenuItem>
                {/* 設定画面への切り替え */}
                <DropdownMenuItem onClick={() => setActiveScreen("settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

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
      {/* 入力部分 */}
      <Card className="mb-4 fixed bottom-0 w-full max-w-3xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between items-center">
            {/* 翻訳元の言語表示 */}
            <span className="font-medium text-gray-700 min-w-[80px] text-center">
              {languages[sourceLang]}
            </span>
            {/* 言語の入れ替えボタン */}
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-gray-600"
              onClick={handleSwapLanguages}
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span className="sr-only">Swap languages</span>
            </Button>
            {/* 翻訳先の言語表示 */}
            <span className="font-medium text-gray-700 min-w-[80px] text-center">
              {languages[targetLang]}
            </span>
          </div>
          {/* 翻訳するテキストを入力するテキストエリア */}
          <textarea
            className="w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-2"
            placeholder="Enter text to translate..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            aria-label="Input text for translation"
          />
          <div className="relative">
            {/* 翻訳結果の表示 */}
            <Label className="w-full p-2 rounded-md border border-gray-300 bg-gray-50 block mb-2 min-h-[64px] text-md">
              {translatedText}
            </Label>
            {/* 翻訳中のローディングインジケーター */}
            {isTranslating && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 rounded-md">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            )}
          </div>
          <div className="flex justify-end mt-2 space-x-4">
            {/* 全ての翻訳を保存するボタン */}
            <ConfirmDialog title="Save all results to vocabulary?" ok="Save">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-gray-600"
                disabled={
                  translationHistory.length === 0 ||
                  translationHistory.some((elem) => elem.saved)
                }
                onClick={() => {
                  translationHistory.forEach((_, index) =>
                    handleSaveTranslation(index)
                  );
                }}
              >
                Save All
              </Button>
            </ConfirmDialog>
            {/* 翻訳履歴に追加するボタン */}
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-gray-600"
              onClick={handleAddToHistory}
            >
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
