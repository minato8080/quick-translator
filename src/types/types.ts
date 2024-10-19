/**
 * 使用可能な言語のリスト
 */
export const languages = {
  en: "English",
  ja: "Japanese",
};

export type LanguagesKeys = keyof typeof languages;

export type WordCard = {
  input: string;
  output: string;
  sourceLang: LanguagesKeys;
  targetLang: LanguagesKeys;
  saved: boolean;
  editing: boolean;
  timestamp: string;
};