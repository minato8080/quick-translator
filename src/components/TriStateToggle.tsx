import { cn } from "@/lib/utils";

/**
 * TriStateToggleコンポーネントのプロパティ
 *
 * @template T - オプションの型
 * @property options - トグルのオプションのリスト
 * @property value - 現在選択されているオプション
 * @property onChange - オプションが変更されたときに呼び出されるコールバック関数
 * @property labels - 各オプションに対応するラベル（オプション）
 * @property disabled - トグルが無効化されているかどうか
 */
interface TriStateToggleProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: React.Dispatch<React.SetStateAction<T>>;
  labels?: readonly T[];
  disabled?: boolean;
  width: number;
  height: number;
  sliderJustify?: "left" | "center";
  sliderClassName?: string;
  buttonClassName?: string | ((option: T) => string);
}

/**
 * TriStateToggleコンポーネント
 *
 * @template T - オプションの型
 * @param props - コンポーネントのプロパティ
 * @returns トグルUIをレンダリングするReactコンポーネント
 */
export function TriStateToggle<T extends string>({
  options,
  value,
  onChange,
  labels,
  disabled,
  width,
  height,
  sliderJustify = "left",
  sliderClassName,
  buttonClassName,
}: TriStateToggleProps<T>) {
  return (
    <div className={`relative w-${width} h-${height} bg-gray-200 rounded-full`}>
      <div
        className={cn(
          "absolute top-1 bottom-1 w-1/3 rounded-full transition-all duration-200 ease-in-out",
          !disabled && "bg-black",
          sliderJustify === "center"
            ? {
                "left-[14%]": value === "year",
                "left-[48%]": value === "month",
                "left-[83%]": value === "day",
              }
            : {
                "left-0": value === options[0],
                "left-1/3": value === options[1],
                "left-2/3": value === options[2],
              },
          sliderClassName
        )}
      />
      {options.map((option, index) => (
        <button
          key={option}
          className={cn(
            "absolute top-0 bottom-0 w-1/3 flex items-center justify-center text-sm font-medium transition-colors duration-200",
            value === option ? "text-white" : "text-gray-600",
            typeof buttonClassName === "function"
              ? buttonClassName(option)
              : buttonClassName
          )}
          style={{ left: `${index * 33.33}%` }}
          onClick={() => onChange(option)} 
          disabled={disabled}
        >
          {labels?.[index]}
        </button>
      ))}
    </div>
  );
}
