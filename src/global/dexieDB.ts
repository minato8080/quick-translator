import { LanguagesKeys } from "@/types/types";
import Dexie, { type EntityTable } from "dexie";

/**
 * 単語帳のエントリを表す型
 * @property {string} timestamp - エントリのタイムスタンプ
 * @property {string} input - 翻訳元のテキスト
 * @property {string} output - 翻訳先のテキスト
 * @property {LanguagesKeys} sourceLang - 翻訳元の言語
 * @property {LanguagesKeys} targetLang - 翻訳先の言語
 */
export type Vocabulary = {
  timestamp: string;
  input: string;
  output: string;
  sourceLang: LanguagesKeys;
  targetLang: LanguagesKeys;
}

/**
 * カレンダーのエントリを表す型
 * @property {string} date - 日付
 * @property {number} count - その日に関連するカウント
 */
export type Calendar = {
  date: string;
  count: number;
}

/**
 * Dexieデータベースのインスタンスを作成
 * @type {Dexie & { vocabulary: EntityTable<Vocabulary, "timestamp">; calendar: EntityTable<Calendar, "date">; }}
 */
const db = new Dexie("quick-translator") as Dexie & {
  vocabulary: EntityTable<
    Vocabulary,
    "timestamp" // 型定義上の主キー
  >;
  calendar: EntityTable<
    Calendar,
    "date" // 型定義上の主キー
  >;
};

// スキーマの宣言
db.version(1).stores({
  vocabulary: "++timestamp, input, output, sourceLang, targetLang", // 実行時の主キーは"timestamp"
  calendar: "++date, count", // 実行時の主キーは"date"
});

export { db };
