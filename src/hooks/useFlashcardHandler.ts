import { useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { FlashcardType } from "@/types/types";

/**
 * フラッシュカードの操作を管理するカスタムフック
 * @returns フラッシュカードの状態と操作関数を含むオブジェクト
 */
export const useFlashcardHandler = () => {
  const [preEditText, setPreEditText] = useState<FlashcardType>({
    input: "",
    output: "",
    sourceLang: "ja",
    targetLang: "en",
    saved: false,
    editing: false,
    timestamp: "",
  });
  const { toast } = useToast();
  const [flashcards, setFlashcards] = useState<Array<FlashcardType>>([]);

  /**
   * 翻訳を保存する関数
   * @param index 保存する翻訳のインデックス
   */
  const handleSaveTranslation = (index: number) => {
    setFlashcards((prev) =>
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
    setFlashcards((prev) => prev.filter((_, i) => i !== index));
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
    setFlashcards((prev) =>
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
    setFlashcards((prev) =>
      prev.map((item, i) => (i === index ? { ...preEditText } : item))
    );
  };

  return {
    flashcards,
    setFlashcards,
    handleSaveTranslation,
    handleDeleteTranslation,
    handleEditTranslation,
    handleCancelEdit,
  };
};
