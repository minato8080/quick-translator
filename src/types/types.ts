/**
 * 使用可能な言語のリスト
 */
export const languages = {
  en: "English",
  ja: "日本語",
} as const;

/**
 * 言語キーの型
 */
export type LanguagesKeys = keyof typeof languages;

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
  saved: boolean;
  editing: boolean;
  timestamp: string;
  visible: boolean;
};

/**
 * Google Translate APIのレスポンス型
 */
export type GoogleTranslateAPIResponse = {
  code: 200 | 400;
  text: string;
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
export type LearningMode = typeof LEARNING_MODES[number];