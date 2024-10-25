"use client";

import * as React from "react";
import { getDaysInMonth } from "date-fns";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatePickerProps {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  disabledYear?: boolean;
  disabledMonth?: boolean;
  disabledDay?: boolean;
}

type DatePart = "year" | "month" | "day";

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

export function DatePicker({ date, setDate }: DatePickerProps) {
  const today = new Date();
  const [year, setYear] = React.useState(
    date?.getFullYear() || today.getFullYear()
  );
  const [month, setMonth] = React.useState(
    date?.getMonth() || today.getMonth()
  );
  const [day, setDay] = React.useState(date?.getDate() || today.getDate());
  const [disabledMonth, setDisabledMonth] = React.useState(false);
  const [disabledDay, setDisabledDay] = React.useState(false);
  const [activePart, setActivePart] = React.useState<DatePart>("month");

  React.useEffect(() => {
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

  const updateDate = (newYear: number, newMonth: number, newDay: number) => {
    const newDate = new Date(newYear, newMonth, newDay);
    setDate(newDate);
    setYear(newDate.getFullYear());
    setMonth(newDate.getMonth());
    setDay(newDate.getDate());
  };

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i
  );
  const months = Array.from({ length: 12 }, (_, i) => i);
  const days = Array.from(
    { length: getDaysInMonth(new Date(year, month)) },
    (_, i) => i + 1
  );

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex space-x-2">
        <Select
          value={year.toString()}
          onValueChange={(value) => updateDate(parseInt(value), month, day)}
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue>{year}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={month.toString()}
          onValueChange={(value) => updateDate(year, parseInt(value), day)}
          disabled={disabledMonth}
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue>{(month + 1).toString().padStart(2, "0")}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={m.toString()}>
                {(m + 1).toString().padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={day.toString()}
          onValueChange={(value) => updateDate(year, month, parseInt(value))}
          disabled={disabledDay}
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue>{(day + 1).toString().padStart(2, "0")}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {days.map((d) => (
              <SelectItem key={d} value={d.toString()}>
                {(d + 1).toString().padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <TriStateToggle value={activePart} onChange={setActivePart} />
    </div>
  );
}
