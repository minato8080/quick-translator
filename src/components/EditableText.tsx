"use client";

import type { SetStateAction } from "react";

import { Volume2 } from "lucide-react";

import type { FlashcardType } from "@/types/types";

import { Button } from "@/components/ui/button";
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
export const EditableText = ({
  io,
  item,
  index,
  lang,
  setFlashcards,
}: {
  io: "input" | "output";
  item: FlashcardType;
  index: number;
  lang: string;
  setFlashcards: (value: SetStateAction<FlashcardType[]>) => void;
}) => {
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
    setFlashcards((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
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

  return (
    <div className="flex justify-between items-center mb-2">
      {/* 翻訳元テキストの表示または編集 */}
      {item.editing ? (
        <Input
          value={item[io]}
          onChange={(e) =>
            handleUpdateTranslation(index, "input", e.target.value)
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
