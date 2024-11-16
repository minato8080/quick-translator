"use client";

import { useState, useEffect, useCallback } from "react";
import React from "react";

import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import type { FLASHCARD_SLICE_NAME } from "@/global/flashcardSlice";
import type { AppDispatch, RootState } from "@/global/store";
import type { TRANSLATE_SLICE_NAME } from "@/global/translateSlice";
import type {
  DeepLTranslateAPIRequest,
  GoogleTranslateAPIRequest,
  GoogleTranslateAPIResponse,
  LanguagesKeys,
} from "@/types/types";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Flashcard } from "@/components/Flashcard";
import { useFlashcardContextHandler } from "@/components/FlashcardHandler";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { changeScreenMode } from "@/global/flashcardSlice";
import { TOAST_STYLE } from "@/global/style";
import {
  changeInput,
  changeLoading,
  changeOutput,
  swapLanguages,
} from "@/global/translateSlice";
import { useToast } from "@/hooks/use-toast";
import { useAlertPopup } from "@/hooks/useAlertPopup";
import { languages } from "@/types/types";

const SaveAllButton = () => {
  const { flashcard, saveInfo } = useSelector<
    RootState,
    RootState[typeof FLASHCARD_SLICE_NAME]
  >((state) => state.flashcard);
  const { handleSaveAllTranslations } = useFlashcardContextHandler();
  return (
    <ConfirmDialog title="Save all results to vocabulary?" ok="Save">
      <Button
        variant="outline"
        size="sm"
        className="hover:bg-gray-600 text-[14px] w-20"
        disabled={flashcard.length === 0 || saveInfo.saved}
        onClick={() => handleSaveAllTranslations()}
      >
        Save All
      </Button>
    </ConfirmDialog>
  );
};

const InputTextarea = ({
  handleAddToHistory,
}: {
  handleAddToHistory: () => void;
}) => {
  const { input, output, loading, sourceLang, targetLang } = useSelector<
    RootState,
    RootState[typeof TRANSLATE_SLICE_NAME]
  >((state) => state.translate);
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const { showAlert } = useAlertPopup();

  /**
   * 翻訳関数
   * @param text 翻訳するテキスト
   * @param sourceLang ソース言語
   * @param targetLang ターゲット言語
   * @returns 翻訳されたテキスト
   */
  const translateWithGoogle = async (
    text: string,
    sourceLang: LanguagesKeys,
    targetLang: LanguagesKeys
  ): Promise<string> => {
    try {
      const params: GoogleTranslateAPIRequest = {
        text,
        source: sourceLang,
        target: targetLang,
      };
      const response = await axios.get<GoogleTranslateAPIResponse>(
        "/api/translate/google/",
        {
          params,
        }
      );

      if (response.data.code !== 200) {
        throw new Error(response.data.text);
      }

      return response.data.text;
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
    if (input) {
      try {
        const result = await translateWithGoogle(input, sourceLang, targetLang);
        dispatch(changeOutput(result));
      } catch {
        toast({
          title: "Translation Error",
          description:
            "An error occurred during translation. Please try again.",
          variant: "destructive",
          style: TOAST_STYLE,
        });
      } finally {
        dispatch(changeLoading(false));
      }
    } else {
      dispatch(changeOutput(""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, sourceLang, targetLang]);

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
    <>
      <textarea
        className="textarea w-full border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-2"
        placeholder="Enter text to translate..."
        value={input}
        onChange={(e) => {
          dispatch(changeLoading(true));
          dispatch(changeInput(e.target.value));
        }}
        onKeyDown={handleKeyDown}
        rows={2}
        aria-label="Input text for translation"
      />
      <div className="relative">
        {/* 翻訳結果の表示 */}
        <textarea
          className="textarea w-full border-gray-300 bg-gray-60 text-gray-700"
          disabled={true}
          value={output}
        />
        {/* 翻訳中のローディングインジケーター */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 rounded-md h-16">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        )}
      </div>
    </>
  );
};

const InputArea = () => {
  const { input, output, loading, sourceLang, targetLang } = useSelector<
    RootState,
    RootState[typeof TRANSLATE_SLICE_NAME]
  >((state) => state.translate);
  const dispatch = useDispatch<AppDispatch>();
  const [rotate, setRotate] = useState(0);
  const { toast } = useToast();
  const { showAlert } = useAlertPopup();
  const { handleAddTranslation } = useFlashcardContextHandler();
  useEffect(() => {
    dispatch(changeScreenMode("translate"));
  }, [dispatch]);

  /**
   * 高精度の翻訳関数
   * @param text 翻訳するテキスト
   * @param sourceLang ソース言語
   * @param targetLang ターゲット言語
   * @returns 翻訳されたテキスト
   */
  const translateWithDeepL = async (
    text: string,
    sourceLang: LanguagesKeys,
    targetLang: LanguagesKeys
  ): Promise<string> => {
    try {
      const params: DeepLTranslateAPIRequest = {
        text,
        source_lang: sourceLang,
        target_lang: targetLang !== "en" ? targetLang : "en-US",
      };
      const response = await axios.post<string>("/api/translate/deepl/", {
        params,
      });

      return response.data;
    } catch (error) {
      console.error("Failed to call the translation API:", error);
      showAlert("error", "Error", "Failed to call the translation API.");
      return "";
    }
  };

  /**
   * 高精度の翻訳を実行する関数
   */
  const handlePreciseTranslation = async () => {
    dispatch(changeLoading(true));
    try {
      const result = await translateWithDeepL(input, sourceLang, targetLang);
      dispatch(changeOutput(result));
    } catch {
      toast({
        title: "Translation Error",
        description: "An error occurred during translation. Please try again.",
        variant: "destructive",
        style: TOAST_STYLE,
      });
    } finally {
      dispatch(changeLoading(false));
    }
  };

  /**
   * 入力テキスト、翻訳結果をクリアする関数
   */
  const handleClear = () => {
    dispatch(changeInput(""));
    dispatch(changeOutput(""));
  };

  /**
   * ソース言語とターゲット言語を入れ替える関数
   */
  const handleSwapLanguages = () => {
    dispatch(swapLanguages());
    setRotate((prev) => prev + 180);
  };

  /**
   * 翻訳履歴に追加する関数
   */
  const handleAddToHistory = () => {
    if (input && output && !loading) {
      handleAddTranslation(input, output, sourceLang, targetLang);
      dispatch(changeInput(""));
      dispatch(changeOutput(""));
    }
  };

  return (
    <Card className="fixed bottom-0 w-full max-w-3xl">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
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
          <motion.div animate={{ rotate }} transition={{ duration: 0.3 }}>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-gray-600"
              onClick={handleSwapLanguages}
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span className="sr-only">Swap languages</span>
            </Button>
          </motion.div>
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
        <InputTextarea handleAddToHistory={handleAddToHistory} />
        <div className="flex justify-end mt-2 space-x-4">
          {/* 高精度の翻訳を行うボタン */}
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-gray-600 text-[14px] w-20"
            onClick={handlePreciseTranslation}
            disabled={input === "" || loading}
          >
            Rethink
          </Button>
          {/* 全ての翻訳を保存するボタン */}
          <SaveAllButton />
          {/* クリアボタン */}
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-gray-600 text-[14px] w-20"
            onClick={handleClear}
            disabled={input === "" && output === ""}
          >
            Clear
          </Button>
          {/* 翻訳履歴に追加するボタン */}
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-gray-600 text-[14px] w-20"
            onClick={handleAddToHistory}
            disabled={input === ""}
          >
            Submit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 翻訳コンポーネント
 * @returns 翻訳機能を提供するReactコンポーネント
 */
export default function Translate() {
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center">
      {/* メインのカードコンテナ */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden fixed">
        <Header english="Translator" japanese="翻訳" />
        {/* メインコンテンツ部分 */}
        <div
          className="p-2 overflow-y-auto"
          style={{ height: "calc(100vh - 257px - 56px)" }}
        >
          {/* 翻訳履歴の表示 */}
          <Flashcard isGroupedView={false} />
        </div>
      </div>
      {/* 入力部分 */}
      <InputArea />
    </div>
  );
}
