"use client";

import { useEffect, useState } from "react";
import React from "react";

import { getDaysInMonth } from "date-fns";
import { parse, format } from "date-fns";
import { useLiveQuery } from "dexie-react-hooks";
import { Search } from "lucide-react";

import { TriStateToggle } from "./TriStateToggle";
import { Button } from "./ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db, type Calendar } from "@/global/dexieDB";

type DatePart = "year" | "month" | "day";

/**
 * DatePickerコンポーネント
 * 日付を選択するためのUIを提供します。
 *
 * @param setDate - 選択された日付を設定するための関数
 * @param calendar - カレンダーのデータ（オプション）
 */
export function DatePicker({
  date,
  setDate,
  calendar,
}: {
  date: string;
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
  useEffect(() => {
    const newDate = new Date(date);
    setYear(newDate.getFullYear());
    setMonth(newDate.getMonth());
    setDay(newDate.getDate());
  }, [date]);

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
        onOpenChange={() => {
          switch (mode) {
            case "year":
              break;
            case "month":
              if (activePart === "year") setActivePart(mode);
            case "day":
              if (["year", "month"].some((p) => p === activePart))
                setActivePart(mode);
              break;
            default:
              break;
          }
        }}
      >
        <SelectTrigger className={`w-[80px] ${disabled && "text-gray-200"}`}>
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
      <TriStateToggle
        options={["year", "month", "day"]}
        value={activePart}
        onChange={setActivePart}
        sliderJustify="center"
        rootClassName="w-256 h-1"
        sliderClassName="top-1/2 -translate-y-1/2 w-3 h-3 bg-primary"
        buttonClassName="top-1/2 -translate-y-1/2 h-4"
      />
    </div>
  );
}

export const DateSearchBox = React.memo(
  ({
    setConditionDate,
  }: {
    setConditionDate: React.Dispatch<React.SetStateAction<string>>;
  }) => {
    const [selectedDate, setSelectedDate] = useState(
      new Date().toLocaleDateString()
    );
    const [initialDate, setInitialDate] = useState(
      new Date().toLocaleDateString()
    );
    const calendar = useLiveQuery(() => {
      return db.calendar?.toArray().then((result) => {
        if (result.length > 0) {
          const latestDate = result
            .map((entry) => entry.date)
            .sort()
            .reverse()[0];
          setConditionDate(latestDate.slice(0, 7));
          setSelectedDate(latestDate);
          setInitialDate(latestDate);
        }

        return result;
      });
    });
    return (
      <div className="flex mb-2">
        {/* 日付選択コンポーネント */}
        <DatePicker
          date={initialDate}
          setDate={setSelectedDate}
          calendar={calendar}
        />
        {/* 検索ボタン */}
        <Button
          variant="outline"
          size="icon"
          className="hover:bg-gray-400 ml-2"
          onClick={() => {
            setConditionDate(selectedDate);
          }}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    );
  }
);

DateSearchBox.displayName = "DateSearchBox";
