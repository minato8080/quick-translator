import { useRef } from "react";

import { format, parse } from "date-fns";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "@/global/store";
import type { FlashcardType, LanguagesKeys, ScreenMode } from "@/types/types";

import { db } from "@/global/dexieDB";
import {
  addFlashcardLeef,
  changeFlashcardLeef,
  changeFlashcard,
  changeSaveInfo,
  informSaveAll,
  type FLASHCARD_SLICE_NAME,
} from "@/global/flashcardSlice";
import { TOAST_STYLE } from "@/global/style";
import { useToast } from "@/hooks/use-toast";
import { FORMAT } from "@/types/types";

export type FlashcardAPI = {
  flashcard: (FlashcardType & { saved: boolean })[];
};

/**
 * フラッシュカードの操作を管理するカスタムフック
 * @returns フラッシュカードの状態と操作関数を含むオブジェクト
 */
export const useFlashcardHandler = (screenMode: ScreenMode) => {
  const { toast } = useToast();
  const { flashcard } = useSelector<
    RootState,
    RootState[typeof FLASHCARD_SLICE_NAME]
  >((state) => state.flashcard);
  const dispatch = useDispatch<AppDispatch>();
  const flashcardAPI = useRef<FlashcardAPI>({
    flashcard: [],
  });

  /**
   * 翻訳履歴に追加する関数
   */
  const handleAddTranslation = (
    inputText: string,
    translatedText: string,
    sourceLang: LanguagesKeys,
    targetLang: LanguagesKeys
  ) => {
    flashcardAPI.current.flashcard = [
      {
        input: inputText,
        output: translatedText,
        sourceLang: sourceLang,
        targetLang: targetLang,
        saved: false,
        timestamp: format(new Date(), FORMAT.TIMESTAMP),
      },
      ...flashcardAPI.current.flashcard,
    ];
    // dispatch(informEditCancel());
    dispatch(
      addFlashcardLeef({
        input: inputText,
        output: translatedText,
        sourceLang: sourceLang,
        targetLang: targetLang,
        saved: false,
        editing: false,
        visible: true,
        timestamp: format(new Date(), FORMAT.TIMESTAMP),
      })
    );
  };

  /**
   * 翻訳を保存する関数
   * @param index 保存する翻訳のインデックス
   */
  const handleSaveTranslation = async (
    item: FlashcardType,
    index: number,
    success?: () => void
  ) => {
    try {
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
          parse(item.timestamp, FORMAT.TIMESTAMP, new Date()),
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

      toast({
        title: "Translation Saved",
        description: "The translation has been saved.",
        style: TOAST_STYLE,
      });
      flashcardAPI.current.flashcard[index].saved = true;
      dispatch(
        changeFlashcardLeef({
          data: flashcardAPI.current.flashcard[index],
          index,
        })
      );
      dispatch(
        changeSaveInfo(flashcardAPI.current.flashcard.every((p) => !p.saved))
      );
      success?.();
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
  const handleSaveAllTranslations = async (success?: () => void) => {
    try {
      const unsavedFlashcard = flashcardAPI.current.flashcard
        .filter(
          (_card, index) => !flashcardAPI.current.flashcard[index].saved
        )
        .map((item) => ({
          input: item.input,
          output: item.output,
          sourceLang: item.sourceLang,
          targetLang: item.targetLang,
          timestamp: item.timestamp,
        }));
      await db.vocabulary.bulkAdd(unsavedFlashcard);

      const dates: string[] = Array.from(
        new Set(
          unsavedFlashcard.map((card) =>
            format(
              parse(card.timestamp, FORMAT.TIMESTAMP, new Date()),
              FORMAT.DATE
            )
          )
        )
      );
      for (const date of dates) {
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
      dispatch(informSaveAll());
      dispatch(changeFlashcard(flashcardAPI.current.flashcard));
      toast({
        title: "All Translations Saved",
        description: "All translations have been saved.",
        style: TOAST_STYLE,
      });
      success?.();
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
  const handleDeleteTranslation = async (
    index: number,
    success?: () => void
  ) => {
    // dispatch(informEditCancel());
    try {
      await db.vocabulary.delete(flashcard[index].timestamp);

      if (flashcardAPI.current.flashcard[index].saved) {
        // タイムスタンプから日付を抽出
        const date = format(
          parse(flashcard[index].timestamp, FORMAT.TIMESTAMP, new Date()),
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

      toast({
        title: "Translation Deleted",
        description: "The translation has been removed from database.",
        style: TOAST_STYLE,
      });
      success?.();
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
    // dispatch(informEditCancel());
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

  return {
    flashcardAPI,
    handleAddTranslation,
    handleSaveAllTranslations,
    handleSaveTranslation,
    handleDeleteTranslation,
    handleDeleteAllTranslations,
  };
};
