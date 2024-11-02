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
  labels?: Record<T, string>;
  disabled: boolean;
}

/**
 * TriStateToggleコンポーネント
 * 
 * @template T - オプションの型
 * @param {TriStateToggleProps<T>} props - コンポーネントのプロパティ
 * @returns {JSX.Element} トグルUIをレンダリングするReactコンポーネント
 */
export function TriStateToggle<T extends string>({
  options,
  value,
  onChange,
  labels,
  disabled,
}: TriStateToggleProps<T>) {
  return (
    <div className="relative w-36 h-8 bg-gray-200 rounded-full">
      <div
        className={cn(
          `absolute top-1 bottom-1 w-1/3 rounded-full transition-all duration-200 ease-in-out ${
            disabled ? "bg-blue-200" : "bg-blue-600"
          }`,
          {
            // 現在の値に基づいてスライダーの位置を決定
            "left-0": value === options[0],
            "left-1/3": value === options[1],
            "left-2/3": value === options[2],
          }
        )}
      />
      {options.map((option, index) => (
        <button
          key={option}
          className={cn(
            "absolute top-0 bottom-0 w-1/3 flex items-center justify-center text-sm font-medium transition-colors duration-200",
            // 現在選択されているオプションに応じてテキストの色を変更
            value === option ? "text-white" : "text-gray-600"
          )}
          style={{ left: `${index * 33.33}%` }} // 各ボタンの位置を設定
          onClick={() => onChange(option)} // ボタンがクリックされたときに選択を変更
          disabled={disabled} // トグルが無効化されている場合、ボタンを無効化
        >
          {labels?.[option] || option} {/* ラベルが提供されていれば表示、なければオプション名を表示 */}
        </button>
      ))}
    </div>
  );
}
