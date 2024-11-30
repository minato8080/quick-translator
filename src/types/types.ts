import type { SourceLanguageCode, TargetLanguageCode } from "deepl-node";

/**
 * 言語キーの型
 */
export type LanguagesKeys = "en" | "ja";

/**
 * 使用可能な言語のリスト
 */
export const languages: Record<LanguagesKeys, string> = {
  en: "English",
  ja: "日本語",
} as const;

/**
 * 画面モードの型
 */
export type ScreenMode = "translate" | "vocabulary";

/**
 * フラッシュカードの型
 */
export type FlashcardType = {
  input: string;
  output: string;
  sourceLang: LanguagesKeys;
  targetLang: LanguagesKeys;
  timestamp: string;
};

/**
 * Google Translate APIのレスポンス型
 */
export type GoogleTranslateAPIResponse = {
  code: 200 | 400;
  text: string;
};

/**
 * Google Translate APIのリクエスト型
 */
export type GoogleTranslateAPIRequest = {
  text: string;
  source: LanguagesKeys;
  target: LanguagesKeys;
};

/**
 * Google Translate APIのレスポンス型
 */
export type DeepLTranslateAPIResponse = {
  translations: {
    detected_source_language: string;
    text: string;
    billed_characters: number;
  }[];
};

/**
 * DeepL Translate APIのリクエスト型
 */
export type DeepLTranslateAPIRequest = {
  text: string;
  source_lang: SourceLanguageCode | null;
  target_lang: TargetLanguageCode;
};

/**
 * 日付フォーマット
 */
export const FORMAT = {
  TIMESTAMP: "yyyy-MM-dd HH:mm:ss",
  DATE: "yyyy-MM-dd",
} as const;

/**
 * 学習モードのリスト
 */
export const LEARNING_MODES = ["origin", "en-ja", "ja-en"] as const;

/**
 * 学習モードの型
 */
export type LearningMode = (typeof LEARNING_MODES)[number];