"use client";

import { useState, useEffect, useCallback } from "react";

import axios from "axios";
import { ArrowRightLeft, Loader2 } from "lucide-react";

import { ConfirmDialog } from "../../components/ConfirmDialog";

import type { GoogleTranslateAPIResponse, LanguagesKeys } from "@/types/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAlertPopup } from "@/hooks/useAlertPopup";
import { languages } from "@/types/types";
import { Header } from "@/components/Header";
import { Flashcard } from "@/components/Flashcard";
import { useFlashcardHandler } from "@/hooks/useFlashcardHandler";
import { AnimatePresence, motion } from "framer-motion";

export default function Translate() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState<LanguagesKeys>("en");
  const [targetLang, setTargetLang] = useState<LanguagesKeys>("ja");
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();
  const { showAlert } = useAlertPopup();

  const flashcardHandler = useFlashcardHandler("translate");
  const { flashcards, setFlashcards, handleSaveAllTranslations } =
    flashcardHandler;

  /**
   * 翻訳関数
   * @param text 翻訳するテキスト
   * @param sourceLang ソース言語
   * @param targetLang ターゲット言語
   * @returns 翻訳されたテキスト
   */
  const translateText = async (
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<string> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API;
      if (!apiUrl) {
        throw new Error("Google Translate API URL is not defined.");
      }
      const response: GoogleTranslateAPIResponse = (
        await axios.get(apiUrl, {
          params: {
            text,
            source: sourceLang,
            target: targetLang,
          },
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })
      ).data;
      if (response.code !== 200) {
        throw new Error(response.text);
      }
      return response.text;
    } catch (error) {
      console.error("Failed to call the translation API:", error);
      showAlert("error", "Error", "Failed to call the translation API.");
      return "";
    }
  };

  /**
   * 翻訳を実行する関数
   */
  const handleTranslation = useCallback(async () => {
    if (inputText) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText, sourceLang, targetLang]);

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
      setFlashcards((prev) => [
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

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center p-4">
      {/* メインのカードコンテナ */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden fixed">
        <Header english="Translator" japanese="翻訳" />
        {/* メインコンテンツ部分 */}
        <div
          className="p-4 overflow-y-auto"
          style={{ height: "calc(100vh - 250px - 68px - 25px)" }}
        >
          {/* 翻訳履歴の表示 */}
          <Flashcard flashcardHandler={flashcardHandler} />
        </div>
      </div>
      {/* 入力部分 */}
      <Card className="mb-4 fixed bottom-0 w-full max-w-3xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between items-center mb-2">
            {/* 翻訳元の言語表示 */}
            <AnimatePresence mode="wait">
              <motion.span
                key={sourceLang}
                className="font-medium text-gray-700 min-w-[80px] text-center"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {languages[sourceLang]}
              </motion.span>
            </AnimatePresence>
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
            <AnimatePresence mode="wait">
              <motion.span
                key={targetLang}
                className="font-medium text-gray-700 min-w-[80px] text-center"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {languages[targetLang]}
              </motion.span>
            </AnimatePresence>
          </div>
          {/* 翻訳するテキストを入力するテキストエリア */}
          <textarea
            className="w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-2"
            placeholder="Enter text to translate..."
            value={inputText}
            onChange={(e) => {
              setIsTranslating(true);
              setInputText(e.target.value);
            }}
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
                className="hover:bg-gray-600 text-[14px]"
                disabled={
                  flashcards.length === 0 ||
                  flashcards.every((elem) => elem.saved)
                }
                onClick={handleSaveAllTranslations}
              >
                Save All
              </Button>
            </ConfirmDialog>
            {/* 翻訳履歴に追加するボタン */}
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-gray-600 text-[14px]"
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
