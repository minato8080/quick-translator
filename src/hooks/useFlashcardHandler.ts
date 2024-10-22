import { useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { FlashcardType } from "@/types/types";
import { db } from "@/global/dexieDB";

/**
 * フラッシュカードの操作を管理するカスタムフック
 * @returns フラッシュカードの状態と操作関数を含むオブジェクト
 */
export const useFlashcardHandler = () => {
  const [editingText, setEditingText] = useState<
    (FlashcardType & { index: number }) | null
  >(null);
  const { toast } = useToast();
  const [flashcards, setFlashcards] = useState<Array<FlashcardType>>([]);

  /**
   * 翻訳を保存する関数
   * @param index 保存する翻訳のインデックス
   */
  const handleSaveTranslation = async (index: number) => {
    try {
      // フラッシュカードのリストを更新するための変数を初期化
      let updatedFlashcards = flashcards;
      // 編集中のテキストが存在する場合、フラッシュカードのリストを更新
      if (editingText) {
        updatedFlashcards = flashcards.map((item, i) =>
          i === editingText.index ? editingText : item
        );
      }
      // 更新されたフラッシュカードをデータベースに保存
      await db.vocabulary.put({ ...updatedFlashcards[index] });
      setFlashcards(
        updatedFlashcards.map((item, i) =>
          i === index ? { ...item, saved: true, editing: false } : item
        )
      );
      toast({
        title: "Translation Saved",
        description: "The translation has been saved to your vocabulary list.",
      });
    } catch (error) {
      toast({
        title: "Vocabulary Addition Error",
        description: `Failed to add vocabulary: ${error}`,
        variant: "destructive",
      });
    }
  };

  /**
   * すべての未保存の翻訳を保存する関数
   */
  const handleSaveAllTranslations = async () => {
    try {
      const unsavedFlashcards = flashcards.filter((card) => !card.saved);
      await db.vocabulary.bulkAdd(unsavedFlashcards);
      setFlashcards((prev) =>
        prev.map((item) => ({ ...item, saved: true, editing: false }))
      );
      toast({
        title: "All Translations Saved",
        description:
          "All unsaved translations have been saved to your vocabulary list.",
      });
    } catch (error) {
      toast({
        title: "Save All Error",
        description: `Failed to save all translations: ${error}`,
        variant: "destructive",
      });
    }
  };

  /**
   * 翻訳を削除する関数
   * @param index 削除する翻訳のインデックス
   */
  const handleDeleteTranslation = async (index: number) => {
    handleCancelEdit();
    try {
      await db.vocabulary.delete(flashcards[index].timestamp);
      // setFlashcards((prev) => prev.filter((_, i) => i !== index));
      toast({
        title: "Translation Deleted",
        description:
          "The translation has been removed from history and database.",
      });
    } catch (error) {
      toast({
        title: "Deletion Error",
        description: `Failed to delete translation: ${error}`,
        variant: "destructive",
      });
    }
  };

  /**
   * 翻訳を編集モードにする関数
   * @param index 編集する翻訳のインデックス
   */
  const handleEditTranslation = (index: number) => {
    handleCancelEdit();
    setEditingText({
      ...flashcards[index],
      editing: true,
      saved: false,
      index,
    });
    setFlashcards((prev) =>
      prev.map((item, i) => (i === index ? { ...item, editing: true } : item))
    );
  };

  /**
   * 編集をキャンセルする関数
   * @param index キャンセルする翻訳のインデックス
   */
  const handleCancelEdit = () => {
    setFlashcards((prev) => prev.map((item) => ({ ...item, editing: false })));
    setEditingText(null);
  };

  return {
    flashcards,
    setFlashcards,
    editingText,
    setEditingText,
    handleSaveAllTranslations,
    handleSaveTranslation,
    handleDeleteTranslation,
    handleEditTranslation,
    handleCancelEdit,
  };
};
