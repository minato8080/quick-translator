"use client";

import type { MutableRefObject, SetStateAction } from "react";
import { useEffect, useState } from "react";
import React from "react";

import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Save, Edit, Check, Eye, EyeOff } from "lucide-react";
import { Volume2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { useFlashcardContextHandler } from "./FlashcardHandler";
import { Switch } from "./ui/switch";

import type { AppDispatch, RootState } from "@/global/store";
import type { FlashcardAPI } from "@/hooks/useFlashcardHandler";
import type { FlashcardType, LearningMode } from "@/types/types";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  changeSaveInfo,
  deleteFlashcardLeef,
  type FLASHCARD_SLICE_NAME,
} from "@/global/flashcardSlice";
import { languages } from "@/types/types";

type IOType = "input" | "output";

/**
 * テキストを音声合成で再生する
 * @param text - 再生するテキスト
 * @param lang - 言語コード
 */
const handleTextToSpeech = (
  text: string,
  lang: string,
  setIsSpeaking: React.Dispatch<SetStateAction<boolean>>
) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === "ja" ? "ja-JP" : "en-US";
  window.speechSynthesis.speak(utterance);
  setIsSpeaking(true);
  utterance.onend = () => setIsSpeaking(false);
};

/**
 * スピーカーボタンコンポーネント
 * @param io - 入力または出力のタイプ
 * @param item - フラッシュカードのアイテム
 * @param lang - 言語コード
 */
const SpeakerButton = ({ text, lang }: { text: string; lang: string }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleTextToSpeech(text, lang, setIsSpeaking)}
    >
      <Volume2 className={`h-4 w-4 text-blue-${isSpeaking ? 600 : 400}`} />
      <span className="sr-only">Listen to source text</span>
    </Button>
  );
};

/**
 * 入力または出力のタイプを切り替える
 * @param learningMode - 学習モードのタイプ
 * @param item - フラッシュカードのアイテム
 * @param io - 入力または出力のタイプ
 * @returns IOType
 */
const switchIO = (
  learningMode: LearningMode,
  item: FlashcardType,
  io: IOType
): IOType => {
  switch (learningMode) {
    case "origin":
      return io;
    case "en-ja":
      return (item.sourceLang === "en") === (io === "input")
        ? "input"
        : "output";
    case "ja-en":
      return (item.targetLang === "en") === (io === "input")
        ? "input"
        : "output";
    default:
      return "input";
  }
};

/**
 * スピーカーの言語を切り替える
 * @param learningMode - 学習モードのタイプ
 * @param item - フラッシュカードのアイテム
 * @param io - 入力または出力のタイプ
 * @returns string
 */
const switchSpeaker = (
  learningMode: LearningMode,
  item: FlashcardType,
  io: IOType
) => {
  switch (learningMode) {
    case "origin":
      return io === "input" ? item.sourceLang : item.targetLang;
    case "en-ja":
      return io === "input" ? "en" : "ja";
    case "ja-en":
      return io === "output" ? "en" : "ja";
    default:
      return "";
  }
};

/**
 * 編集可能なテキストコンポーネント
 * @param io - 入力または出力のタイプ
 * @param item - フラッシュカードのアイテム
 */
const EditableText = ({
  io,
  item,
  isVisible,
  isEditing,
  index,
  flashcardAPI,
}: {
  io: IOType;
  item: FlashcardType;
  isVisible: boolean;
  isEditing: boolean;
  index: number;
  flashcardAPI: MutableRefObject<FlashcardAPI>;
}) => {
  const { flashcard } = useSelector<
    RootState,
    RootState[typeof FLASHCARD_SLICE_NAME]
  >((state) => state.flashcard);
  const { isLearningMode } = useSelector<
    RootState,
    RootState[typeof FLASHCARD_SLICE_NAME]
  >((state) => state.flashcard);
  const [editingText, setEditingText] = useState("");
  useEffect(() => {
    setEditingText(item[io]);
  }, [item, io, isEditing]);
  useEffect(() => {
    flashcardAPI.current.flashcard = JSON.parse(JSON.stringify(flashcard));
  }, [flashcard, flashcardAPI]);

  return (
    <>
      {isEditing ? (
        <textarea
          value={editingText}
          onChange={(e) => {
            const value = e.target.value;
            setEditingText(value);
            flashcardAPI.current.flashcard[index][io] = value;
          }}
          className="textarea field-sizing-content"
        />
      ) : (
        <textarea
          className={`${
            !isLearningMode
              ? "text-gray-800"
              : io === "output" && !isVisible
              ? "text-transparent"
              : "text-gray-800"
          } textarea field-sizing-content bg-white border-white`}
          disabled={true}
          value={item[io]}
        />
      )}
    </>
  );
};

/**
 * カード本体コンポーネント
 * @param flashcardHandler - フラッシュカードのハンドラー
 * @param items - フラッシュカードのアイテムリスト
 * @param startIndex - 開始インデックス
 * @param isLearningMode - 学習モードかどうか
 * @param learningMode - 学習モードのタイプ
 */
const CardLeef = ({ item, index }: { item: FlashcardType; index: number }) => {
  const {
    learningMode,
    isLearningMode,
    isVisibleParent,
    screenMode,
    saveInfo,
  } = useSelector<RootState, RootState[typeof FLASHCARD_SLICE_NAME]>(
    (state) => state.flashcard
  );
  const dispatch = useDispatch<AppDispatch>();

  const [isVisible, setIsVisible] = useState(true);
  const [isSaved, setIsSaved] = useState(screenMode === "vocabulary");
  const [isEditing, setIsEditing] = useState(false);
  const { flashcardAPI, handleSaveTranslation, handleDeleteTranslation } =
    useFlashcardContextHandler();
  useEffect(() => setIsVisible(isVisibleParent), [isVisibleParent]);
  useEffect(() => {
    if (isLearningMode) setIsEditing(false);
  }, [isLearningMode]);
  useEffect(() => {
    setIsSaved(saveInfo.data[index].value);
    setIsEditing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveInfo.data[index].watch]);

  return (
    <motion.div
      key={item.timestamp}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* 各翻訳履歴のカード */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="p-3 h-10">
          <AnimatePresence mode="wait">
            <div className="flex justify-between items-start mb-1">
              {/* 翻訳元の言語表示 */}
              <span className="text-[12px] font-medium text-gray-400">
                {languages[item.sourceLang]} → {languages[item.targetLang]}
              </span>
              {/* ボタンを配置する場所*/}
              <div className="flex space-x-1">
                {isLearningMode ? (
                  <motion.div
                    key={isEditing ? "editing" : isSaved ? "saved" : "unsaved"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center space-x-2 h-4">
                      {isVisible ? (
                        <Eye className="h-4 w-4 text-blue-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-blue-400" />
                      )}
                      <Switch
                        id="text-area-toggle"
                        checked={isVisible}
                        onCheckedChange={() => {
                          setIsVisible((b) => !b);
                        }}
                        className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-blue-400"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex items-center space-x-2 h-4">
                    <ConfirmDialog title="Save to vocabulary?" ok="Save">
                      {/* 保存ボタン */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleSaveTranslation(
                            isEditing
                              ? flashcardAPI.current.flashcard[index]
                              : item,
                            index,
                            () => {
                              setIsSaved(true);
                              setIsEditing(false);
                            }
                          )
                        }
                        disabled={isEditing ? false : isSaved}
                      >
                        <motion.div
                          key={
                            isEditing
                              ? "unsaved"
                              : isSaved
                              ? "saved"
                              : "unsaved"
                          }
                          initial={{ opacity: 0, rotate: -180 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: 180 }}
                          transition={{ duration: 0.3 }}
                        >
                          {isEditing ? (
                            <Save className="h-4 w-4 text-blue-600" />
                          ) : isSaved ? (
                            <Check className="h-4 w-4 text-blue-400" />
                          ) : (
                            <Save className="h-4 w-4 text-blue-600" />
                          )}
                        </motion.div>
                        <span className="sr-only">
                          {isEditing
                            ? "Save changes"
                            : isSaved
                            ? "Saved"
                            : "Save translation"}
                        </span>
                      </Button>
                    </ConfirmDialog>
                    {/* 編集ボタン */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // 編集モードを切り替える
                        setIsEditing((p) => !p);
                        // フラッシュカードAPIの編集状態を更新
                        flashcardAPI.current.flashcard[index].editing =
                          !isEditing;
                        if (screenMode === "translate") {
                          // 保存情報を更新
                          dispatch(
                            changeSaveInfo(
                              flashcardAPI.current.flashcard.every(
                                (p) => !p.saved || p.editing
                              )
                            )
                          );
                        }
                      }}
                    >
                      <motion.div
                        key={
                          isEditing ? "editing" : isSaved ? "saved" : "unsaved"
                        }
                        initial={{ opacity: 0, rotate: -180 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        {isEditing ? (
                          <RotateCcw className="h-4 w-4 text-teal-600" />
                        ) : (
                          <Edit className="h-4 w-4 text-teal-600" />
                        )}
                      </motion.div>
                      <span className="sr-only">
                        {isEditing ? "Cancel edit" : "Edit translation"}
                      </span>
                    </Button>
                    {/* 翻訳の削除ボタン */}
                    <ConfirmDialog title="Delete this?" ok="OK">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={
                          () =>
                            handleDeleteTranslation(index, () => {
                              if (screenMode === "translate")
                                dispatch(deleteFlashcardLeef(index));
                            })
                        }
                      >
                        <X className="h-4 w-4 text-pink-600" />
                        <span className="sr-only">Delete translation</span>
                      </Button>
                    </ConfirmDialog>
                  </div>
                )}
              </div>
            </div>
          </AnimatePresence>
        </CardHeader>
        <CardContent className="p-1">
          {/* 翻訳元テキストの表示または編集 */}
          <div className="flex justify-between items-center mb-2">
            <EditableText
              io={switchIO(learningMode, item, "input")}
              item={item}
              isVisible={isVisible}
              isEditing={isEditing}
              index={index}
              flashcardAPI={flashcardAPI}
            />
            <SpeakerButton
              text={item[switchIO(learningMode, item, "input")]}
              lang={switchSpeaker(learningMode, item, "input")}
            />
          </div>
          {/* 翻訳先テキストの表示または編集 */}
          <div className="flex justify-between items-center mb-1">
            <EditableText
              io={switchIO(learningMode, item, "output")}
              item={item}
              isVisible={isVisible}
              isEditing={isEditing}
              index={index}
              flashcardAPI={flashcardAPI}
            />
            <SpeakerButton
              text={item[switchIO(learningMode, item, "output")]}
              lang={switchSpeaker(learningMode, item, "output")}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * カード本体コンポーネント
 * @param flashcardHandler - フラッシュカードのハンドラー
 * @param items - フラッシュカードのアイテムリスト
 * @param startIndex - 開始インデックス
 * @param isLearningMode - 学習モードかどうか
 * @param learningMode - 学習モードのタイプ
 */
const CardCore = ({
  items,
  startIndex = 0,
}: {
  items: FlashcardType[];
  startIndex?: number;
}) => {
  return (
    <>
      {items.map((item, divisionIndex) => (
        <CardLeef
          key={item.timestamp}
          index={startIndex + divisionIndex}
          item={item}
        />
      ))}
    </>
  );
};

/**
 * フラッシュカードコンポーネント
 * @param flashcardHandler - フラッシュカードのハンドラー
 * @param isGroupedView - グループ化されたビューかどうか
 * @param isLearningMode - 学習モードかどうか
 * @param learningMode - 学習モードのタイプ
 */
export const Flashcard = React.memo(
  ({ isGroupedView }: { isGroupedView: boolean }) => {
    const { flashcard } = useSelector<
      RootState,
      RootState[typeof FLASHCARD_SLICE_NAME]
    >((state) => state.flashcard);
    const [groupedHistory, setGroupedHistory] = useState<
      Record<string, FlashcardType[]>
    >({});

    useEffect(() => {
      if (isGroupedView) {
        const newGroupedHistory = flashcard.reduce((acc, item) => {
          const date = format(new Date(item.timestamp), "yyyy/MM/dd");
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(item);
          return acc;
        }, {} as Record<string, typeof flashcard>);
        setGroupedHistory(newGroupedHistory);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flashcard]);

    return (
      <AnimatePresence>
        {isGroupedView ? (
          ((indexAdjuster = 0) =>
            Object.entries(groupedHistory).map(([date, items]) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-2 m-1">
                  <div className="h-px bg-gray-300 flex-grow" />
                  <h3 className="text-md font-semibold text-gray-500">
                    {date}
                  </h3>
                  <div className="h-px bg-gray-300 flex-grow" />
                </div>
                <CardCore
                  items={items}
                  startIndex={(() => {
                    const index = indexAdjuster;
                    indexAdjuster += items.length;
                    return index;
                  })()}
                />
              </motion.div>
            )))()
        ) : (
          <CardCore items={flashcard} />
          // <CardCore items={flashcard} />
        )}
      </AnimatePresence>
    );
  }
);
Flashcard.displayName = "Flashcard";

export default Flashcard;
