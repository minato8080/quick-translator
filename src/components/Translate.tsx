"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  ArrowRightLeft,
  Loader2,
  X,
  Save,
  Edit,
  Menu,
  Book,
  Settings,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

/**
 * 使用可能な言語のリスト
 */
const languages = {
  en: "English",
  ja: "Japanese",
};
type LanguagesKeys = keyof typeof languages;

/**
 * 擬似的な翻訳関数
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
  await new Promise((resolve) => setTimeout(resolve, 300)); // API遅延をシミュレート
  return `${targetLang === "ja" ? "翻訳: " : "Translated: "}${text}`;
};

export default function Translate() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState<LanguagesKeys>("ja");
  const [targetLang, setTargetLang] = useState<LanguagesKeys>("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationHistory, setTranslationHistory] = useState<
    Array<{ input: string; output: string; saved: boolean; editing: boolean }>
  >([]);
  const [activeScreen, setActiveScreen] = useState<
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
      } catch (error) {
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
    setInputText(translatedText.replace(/^(Translated: |翻訳: )/, ""));
    setTranslatedText("");
  };

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

  /**
   * 翻訳履歴に追加する関数
   */
  const handleAddToHistory = () => {
    if (inputText && translatedText && !isTranslating) {
      setTranslationHistory((prev) => [
        {
          input: inputText,
          output: translatedText,
          saved: false,
          editing: false,
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
      prev.map((item, i) =>
        i === index ? { ...item, editing: true, saved: false } : item
      )
    );
  };

  /**
   * 翻訳を更新する関数
   * @param index 更新する翻訳のインデックス
   * @param field 更新するフィールド（inputまたはoutput）
   * @param value 更新する値
   */
  const handleUpdateTranslation = (
    index: number,
    field: "input" | "output",
    value: string
  ) => {
    setTranslationHistory((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Quick Translator</h1>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="User"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your Profile</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
                <DropdownMenuItem onClick={() => setActiveScreen("translate")}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  <span>Translate</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveScreen("vocabulary")}>
                  <Book className="mr-2 h-4 w-4" />
                  <span>Vocabulary</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveScreen("settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="p-4">
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">
                  {languages[sourceLang]}
                </span>
                <Button variant="ghost" size="sm" onClick={handleSwapLanguages}>
                  <ArrowRightLeft className="h-4 w-4" />
                  <span className="sr-only">Swap languages</span>
                </Button>
                <span className="font-medium text-gray-700">
                  {languages[targetLang]}
                </span>
              </div>
              <textarea
                className="w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-2"
                placeholder="Enter text to translate..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={4}
                aria-label="Input text for translation"
              />
              <div className="relative">
                <Label className="w-full p-2 rounded-md border border-gray-300 bg-gray-50 block mb-2 min-h-[96px]">
                  {translatedText.replace(/^(Translated: |翻訳: )/, "")}
                </Label>
                {isTranslating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 rounded-md">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddToHistory}
                >
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>

          <AnimatePresence>
            {translationHistory.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="mb-2 hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-gray-500">
                        {languages[sourceLang]}
                      </span>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            item.editing
                              ? handleSaveTranslation(index)
                              : handleEditTranslation(index)
                          }
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
                        {!item.editing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTranslation(index)}
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                            <span className="sr-only">Edit translation</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTranslation(index)}
                        >
                          <X className="h-4 w-4 text-red-600" />
                          <span className="sr-only">Delete translation</span>
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      {item.editing ? (
                        <Input
                          value={item.input}
                          onChange={(e) =>
                            handleUpdateTranslation(
                              index,
                              "input",
                              e.target.value
                            )
                          }
                          className="flex-grow mr-2"
                        />
                      ) : (
                        <p className="text-gray-800">{item.input}</p>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleTextToSpeech(item.input, sourceLang)
                        }
                      >
                        <Volume2 className="h-4 w-4 text-blue-600" />
                        <span className="sr-only">Listen to source text</span>
                      </Button>
                    </div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-gray-500">
                        {languages[targetLang]}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      {item.editing ? (
                        <Input
                          value={item.output.replace(
                            /^(Translated: |翻訳: )/,
                            ""
                          )}
                          onChange={(e) =>
                            handleUpdateTranslation(
                              index,
                              "output",
                              e.target.value
                            )
                          }
                          className="flex-grow mr-2"
                        />
                      ) : (
                        <p className="text-gray-800">
                          {item.output.replace(/^(Translated: |翻訳: )/, "")}
                        </p>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleTextToSpeech(
                            item.output.replace(/^(Translated: |翻訳: )/, ""),
                            targetLang
                          )
                        }
                      >
                        <Volume2 className="h-4 w-4 text-blue-600" />
                        <span className="sr-only">
                          Listen to translated text
                        </span>
                      </Button>
                    </div>
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
