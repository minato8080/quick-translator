/**
 * 使用可能な言語のリスト
 */
export const languages = {
  en: "English",
  ja: "日本語",
} as const;

export type LanguagesKeys = keyof typeof languages;

export type FlashcardType = {
  input: string;
  output: string;
  sourceLang: LanguagesKeys;
  targetLang: LanguagesKeys;
  saved: boolean;
  editing: boolean;
  timestamp: string;
};

/**
 * Google Translate APIのレスポンス型
 */
export type GoogleTranslateAPIResponse = {
  code: 200 | 400;
  text: string;
};
