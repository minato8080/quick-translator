"use client";

import { useState, useEffect, useCallback, useLayoutEffect } from "react";
import React from "react";

import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import type { FLASHCARD_SLICE_NAME } from "@/global/flashcardSlice";
import type { AppDispatch, RootState } from "@/global/store";
import type {
  DeepLTranslateAPIRequest,
  GoogleTranslateAPIRequest,
  GoogleTranslateAPIResponse,
  HeaderComponentType,
  LanguagesKeys,
} from "@/types/types";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Flashcard } from "@/components/Flashcard";
import { useFlashcardContextHandler } from "@/components/FlashcardHandler";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { resetFlashcard } from "@/global/flashcardSlice";
import { TOAST_STYLE } from "@/global/style";
import { useToast } from "@/hooks/use-toast";
import { useAlertPopup } from "@/hooks/useAlertPopup";
import { languages } from "@/types/types";

/**
 * 入力エリアの型
 */
type TranslateIO = {
  input: string;
  output: string;
  sourceLang: LanguagesKeys;
  targetLang: LanguagesKeys;
  loading: boolean;
};

/**
 * 保存ボタンコンポーネント
 */
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

/**
 * 入力テキストエリアコンポーネント
 * @param handleAddToHistory 翻訳履歴に追加する関数
 * @param translationState 翻訳の状態を保持するオブジェクト
 * @param setTranslationState 翻訳の状態を更新する関数
 */
const InputTextarea = ({
  handleAddToHistory,
  translationState,
  setTranslationState,
}: {
  handleAddToHistory: () => void;
  translationState: TranslateIO;
  setTranslationState: React.Dispatch<React.SetStateAction<TranslateIO>>;
}) => {
  const { input, output, loading, sourceLang, targetLang } = translationState;
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
        setTranslationState((prev) => ({ ...prev, output: result }));
      } catch {
        toast({
          title: "Translation Error",
          description:
            "An error occurred during translation. Please try again.",
          variant: "destructive",
          style: TOAST_STYLE,
        });
      } finally {
        setTranslationState((prev) => ({ ...prev, loading: false }));
      }
    } else {
      setTranslationState((prev) => ({ ...prev, output: "" }));
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
   * 一定時間経過後にローダーを無効化する
   */
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setTranslationState((prev) => ({ ...prev, loading: false }));
    }, 10000);

    return () => clearTimeout(loadingTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

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
          setTranslationState((prev) => ({
            ...prev,
            loading: true,
            input: e.target.value,
          }));
        }}
        onKeyDown={handleKeyDown}
        rows={2}
        aria-label="Input text for translation"
        autoCapitalize="off" // iOSデバイスの大文字補正を無効化
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

/**
 * 翻訳入力エリアコンポーネント
 */
const InputArea = () => {
  const [translationState, setTranslationState] = useState<TranslateIO>({
    input: "",
    output: "",
    sourceLang: "en",
    targetLang: "ja",
    loading: false,
  });
  const { input, output, sourceLang, targetLang, loading } = translationState;
  const [rotate, setRotate] = useState(0);
  const { toast } = useToast();
  const { showAlert } = useAlertPopup();
  const { handleAddTranslation } = useFlashcardContextHandler();

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
    setTranslationState((prev) => ({ ...prev, loading: true }));
    try {
      const result = await translateWithDeepL(input, sourceLang, targetLang);
      setTranslationState((prev) => ({ ...prev, output: result }));
    } catch {
      toast({
        title: "Translation Error",
        description: "An error occurred during translation. Please try again.",
        variant: "destructive",
        style: TOAST_STYLE,
      });
    } finally {
      setTranslationState((prev) => ({ ...prev, loading: false }));
    }
  };

  /**
   * 入力テキスト、翻訳結果をクリアする関数
   */
  const handleClear = () => {
    setTranslationState((prev) => ({ ...prev, input: "", output: "" }));
  };

  /**
   * ソース言語とターゲット言語を入れ替える関数
   */
  const handleSwapLanguages = () => {
    setTranslationState((prev) => ({
      ...prev,
      input: prev.output,
      output: prev.input,
      sourceLang: prev.targetLang,
      targetLang: prev.sourceLang,
    }));
    setRotate((prev) => prev + 180);
  };

  /**
   * 翻訳履歴に追加する関数
   */
  const handleAddToHistory = () => {
    if (input && output && !loading) {
      handleAddTranslation(input, output, sourceLang, targetLang);
      setTranslationState((prev) => ({ ...prev, input: "", output: "" }));
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
        <InputTextarea
          handleAddToHistory={handleAddToHistory}
          translationState={translationState}
          setTranslationState={setTranslationState}
        />
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
 */
export default function Translate({ Header }: { Header: HeaderComponentType }) {
  const dispatch = useDispatch<AppDispatch>();

  useLayoutEffect(() => {
    dispatch(resetFlashcard("translate"));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center">
      {/* メインのカードコンテナ */}
      <div className="w-full max-w-3xl bg-white shadow-xl overflow-hidden fixed">
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
