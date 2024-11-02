import { useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { FlashcardType, ScreenMode, FORMAT } from "@/types/types";
import { db } from "@/global/dexieDB";
import { format, parse } from "date-fns";
import { TOAST_STYLE } from "@/global/style";

/**
 * フラッシュカードの操作を管理するカスタムフック
 * @returns フラッシュカードの状態と操作関数を含むオブジェクト
 */
export const useFlashcardHandler = (screenMode: ScreenMode) => {
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
        updatedFlashcards = flashcards.map((item) =>
          item.timestamp === editingText.timestamp ? editingText : item
        );
      }
      // 更新されたフラッシュカードをデータベースに保存
      const item = updatedFlashcards[index];
      await db.vocabulary.put({
        input: item.input,
        output: item.output,
        sourceLang: item.sourceLang,
        targetLang: item.targetLang,
        timestamp: item.timestamp,
      });

      if (screenMode === "translate") {
        // タイムスタンプから日付を抽出
        const date = format(
          parse(
            updatedFlashcards[index].timestamp,
            FORMAT.TIMESTAMP,
            new Date()
          ),
          FORMAT.DATE
        );

        // 同じ日付のエントリー数をカウント
        const sameDateEntries = await db.vocabulary
          .where("timestamp")
          .startsWith(date)
          .count();

        // カレンダーに日付とエントリー数を保存
        await db.calendar.put({
          date: date,
          count: sameDateEntries,
        });
      }

      setFlashcards(
        updatedFlashcards.map((item, i) =>
          i === index ? { ...item, saved: true, editing: false } : item
        )
      );
      toast({
        title: "Translation Saved",
        description: "The translation has been saved.",
        style: TOAST_STYLE,
      });
    } catch (error) {
      toast({
        title: "Vocabulary Addition Error",
        description: `Failed to add vocabulary: ${error}`,
        variant: "destructive",
        style: TOAST_STYLE,
      });
    }
  };

  /**
   * すべての未保存の翻訳を保存する関数
   */
  const handleSaveAllTranslations = async () => {
    try {
      // フラッシュカードのリストを更新するための変数を初期化
      let updatedFlashcards = flashcards;
      // 編集中のテキストが存在する場合、フラッシュカードのリストを更新
      if (editingText) {
        updatedFlashcards = flashcards.map((item) =>
          item.timestamp === editingText.timestamp ? editingText : item
        );
      }
      const unsavedFlashcards = updatedFlashcards
        .filter((card) => !card.saved)
        .map((item) => ({
          input: item.input,
          output: item.output,
          sourceLang: item.sourceLang,
          targetLang: item.targetLang,
          timestamp: item.timestamp,
        }));
      await db.vocabulary.bulkAdd(unsavedFlashcards);

      const dates: string[] = Array.from(
        new Set(
          unsavedFlashcards.map((card) =>
            format(
              parse(card.timestamp, FORMAT.TIMESTAMP, new Date()),
              FORMAT.DATE
            )
          )
        )
      );
      for (let date of dates) {
        // 同じ日付のエントリー数をカウント
        const sameDateEntries = await db.vocabulary
          .where("timestamp")
          .startsWith(date)
          .count();

        // カレンダーに日付とエントリー数を保存
        await db.calendar.put({
          date: date,
          count: sameDateEntries,
        });
      }
      setFlashcards((prev) =>
        prev.map((item) => ({ ...item, saved: true, editing: false }))
      );
      toast({
        title: "All Translations Saved",
        description: "All translations have been saved.",
        style: TOAST_STYLE,
      });
    } catch (error) {
      toast({
        title: "Save All Error",
        description: `Failed to save all translations: ${error}`,
        variant: "destructive",
        style: TOAST_STYLE,
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

      if (flashcards[index].saved) {
        // タイムスタンプから日付を抽出
        const date = format(
          parse(flashcards[index].timestamp, FORMAT.TIMESTAMP, new Date()),
          FORMAT.DATE
        );

        // 同じ日付
        const result = await db.calendar.get({ date: date });
        if (!result) return;
        if (result.count > 1) {
          // カレンダーを更新
          await db.calendar.put({
            date: date,
            count: result.count - 1,
          });
        } else {
          // カレンダーから削除
          await db.calendar.where("date").equals(date).delete();
        }
      }
      // vocabulary画面は自動クエリなので操作しない
      if (screenMode !== "vocabulary")
        setFlashcards((prev) => prev.filter((_, i) => i !== index));

      toast({
        title: "Translation Deleted",
        description: "The translation has been removed from database.",
        style: TOAST_STYLE,
      });
    } catch (error) {
      toast({
        title: "Deletion Error",
        description: `Failed to delete translation: ${error}`,
        variant: "destructive",
        style: TOAST_STYLE,
      });
    }
  };

  /**
   * すべての表示中の翻訳を削除する関数
   */
  const handleDeleteAllTranslations = async (condition: string) => {
    handleCancelEdit();
    try {
      // データベースから削除
      await db.vocabulary.where("timestamp").startsWith(condition).delete();
      // カレンダーから削除
      await db.calendar.where("date").startsWith(condition).delete();

      toast({
        title: "All Translations Deleted",
        description: "All translations have been removed from database.",
        style: TOAST_STYLE,
      });
    } catch (error) {
      toast({
        title: "Deletion Error",
        description: `Failed to delete all translations: ${error}`,
        variant: "destructive",
        style: TOAST_STYLE,
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
    handleDeleteAllTranslations,
    handleEditTranslation,
    handleCancelEdit,
  };
};
