import { LanguagesKeys } from "@/types/types";
import Dexie, { type EntityTable } from "dexie";

export type Vocabulary = {
  timestamp: string;
  input: string;
  output: string;
  sourceLang: LanguagesKeys;
  targetLang: LanguagesKeys;
}
export type Calendar = {
  date: string;
  count: number;
}
const db = new Dexie("quick-translator") as Dexie & {
  vocabulary: EntityTable<
    Vocabulary,
    "timestamp" // primary key "id" (for the typings only)
  >;
  calendar: EntityTable<
    Calendar,
    "date" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  vocabulary: "++timestamp, input, output, sourceLang, targetLang", // primary key "timestamp" (for the runtime!)
  calendar: "++date, count", // primary key "date" (for the runtime!)
});

export { db };
