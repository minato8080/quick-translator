import { LanguagesKeys } from "@/types/types";
import Dexie, { type EntityTable } from "dexie";

interface Vocabulary {
  timestamp: string;
  input: string;
  output: string;
  sourceLang: LanguagesKeys;
  targetLang: LanguagesKeys;
}
interface Calender {
  date: string;
  count: number;
}

const db = new Dexie("vocabulary") as Dexie & {
  vocabulary: EntityTable<
    Vocabulary,
    "timestamp" // primary key "id" (for the typings only)
  >;
  calender: EntityTable<
    Calender,
    "date" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  vocabulary: "++timestamp, input, output, sourceLang, targetLang", // primary key "timestamp" (for the runtime!)
  calender: "++date, count", // primary key "date" (for the runtime!)
});

export { db };
