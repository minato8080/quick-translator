"use client";

import { useEffect, useState } from "react";

import { getDaysInMonth } from "date-fns";
import { parse, format } from "date-fns";

import type { Calendar } from "@/global/dexieDB";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";


type DatePart = "year" | "month" | "day";

/**
 * TriStateToggleコンポーネント
 * 年、月、日を切り替えるためのトグルUIを提供します。
 *
 * @param value - 現在選択されている日付の部分（year, month, day）
 * @param onChange - 日付の部分が変更されたときに呼び出されるコールバック関数
 */
const TriStateToggle = ({
  value,
  onChange,
}: {
  value: DatePart;
  onChange: (value: DatePart) => void;
}) => {
  return (
    <div className="relative w-[256px] h-1 bg-gray-200 rounded-full">
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full transition-all duration-200 ease-in-out",
          {
            "left-[16.67%]": value === "year",
            "left-[50%]": value === "month",
            "left-[83.33%]": value === "day",
          }
        )}
      />
      {["year", "month", "day"].map((part, index) => (
        <button
          key={part}
          className="absolute top-1/2 -translate-y-1/2 w-1/3 h-4 flex items-center justify-center"
          style={{ left: `${index * 33.33}%` }}
          onClick={() => onChange(part as DatePart)}
        />
      ))}
    </div>
  );
};

/**
 * DatePickerコンポーネント
 * 日付を選択するためのUIを提供します。
 *
 * @param setDate - 選択された日付を設定するための関数
 * @param calendar - カレンダーのデータ（オプション）
 */
export function DatePicker({
  setDate,
  calendar,
}: {
  setDate: React.Dispatch<React.SetStateAction<string>>;
  calendar?: Calendar[];
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [day, setDay] = useState(today.getDate());
  const [disabledMonth, setDisabledMonth] = useState(false);
  const [disabledDay, setDisabledDay] = useState(false);
  const [activePart, setActivePart] = useState<DatePart>("month");

  // activePartが変更されたときに、月と日の選択を無効化するかどうかを決定
  useEffect(() => {
    switch (activePart) {
      case "year":
        setDisabledMonth(true);
        setDisabledDay(true);
        break;
      case "month":
        setDisabledMonth(false);
        setDisabledDay(true);
        break;
      case "day":
        setDisabledMonth(false);
        setDisabledDay(false);
        break;
    }
  }, [activePart]);

  // 年、月、日、または無効化状態が変更されたときに、選択された日付を更新
  useEffect(() => {
    let conditionDate = format(new Date(year, month, day), "yyyy-MM-dd");
    if (disabledDay)
      conditionDate = conditionDate.split("-").slice(0, -1).join("-");
    if (disabledMonth)
      conditionDate = conditionDate.split("-").slice(0, -1).join("-");

    setDate(conditionDate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, day, disabledMonth, disabledDay]);

  /**
   * 日付の部分を更新する関数
   *
   * @param mode - 更新する日付の部分（year, month, day）
   * @param newState - 新しい値
   */
  const updateDate = (mode: DatePart, newState: number) => {
    switch (mode) {
      case "year":
        setYear(newState);
        break;
      case "month":
        setMonth(newState - 1);
        break;
      case "day":
        setDay(newState);
        break;
    }
  };

  // 年、月、日の選択肢を生成
  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from(
    { length: getDaysInMonth(new Date(year, month)) },
    (_, i) => i + 1
  );

  /**
   * DatePickSelectboxコンポーネント
   * 年、月、日を選択するためのセレクトボックスを提供します。
   *
   * @param mode - 選択する日付の部分（year, month, day）
   * @param items - 選択肢のリスト
   * @param disabled - セレクトボックスが無効化されているかどうか
   * @param digit - 表示する桁数
   * @param itemWidth - 各アイテムの幅
   */
  const DatePickSelectbox = ({
    mode,
    items,
    disabled,
    digit,
    itemWidth,
  }: {
    mode: DatePart;
    items: number[];
    disabled: boolean;
    digit: number;
    itemWidth: number;
  }) => {
    let selectVal: number;
    switch (mode) {
      case "year":
        selectVal = year;
        break;
      case "month":
        selectVal = month + 1;
        break;
      case "day":
        selectVal = day;
        break;
    }

    /**
     * カレンダーにデータがあるかどうかを確認する関数
     *
     * @param item - 確認するアイテム
     * @returns データがある場合はtrue、ない場合はfalse
     */
    const hasData = (item: number) => {
      if (!calendar) return false;
      return calendar.some((cal) => {
        const date = parse(cal.date, "yyyy-MM-dd", new Date());
        switch (mode) {
          case "year":
            return item === date.getFullYear();
          case "month":
            return item - 1 === date.getMonth() && year === date.getFullYear();
          case "day":
            return (
              item === date.getDate() &&
              month === date.getMonth() &&
              year === date.getFullYear()
            );
        }
      });
    };

    return (
      <Select
        value={selectVal.toString()}
        onValueChange={(value) => updateDate(mode, parseInt(value))}
        disabled={disabled}
      >
        <SelectTrigger className="w-[80px]">
          <SelectValue>{selectVal.toString().padStart(digit, "0")}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem
              key={item}
              value={item.toString()}
              className={
                hasData(item)
                  ? `text-primary font-bold bg-indigo-200 m-1 rounded-full border-2 border-indigo-400 w-[${itemWidth}px] hover:border-indigo-600`
                  : "m-1"
              }
              disabled={!hasData(item)}
            >
              {item.toString().padStart(digit, "0")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex space-x-2">
        <DatePickSelectbox
          mode="year"
          items={years}
          disabled={false}
          digit={4}
          itemWidth={65}
        />
        <DatePickSelectbox
          mode="month"
          items={months}
          disabled={disabledMonth}
          digit={2}
          itemWidth={50}
        />
        <DatePickSelectbox
          mode="day"
          items={days}
          disabled={disabledDay}
          digit={2}
          itemWidth={50}
        />
      </div>
      <TriStateToggle value={activePart} onChange={setActivePart} />
    </div>
  );
}
