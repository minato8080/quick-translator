import { cn } from "@/lib/utils";

interface TriStateToggleProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: React.Dispatch<React.SetStateAction<T>>;
  labels?: Record<T, string>;
  disabled: boolean;
}

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
            value === option ? "text-white" : "text-gray-600"
          )}
          style={{ left: `${index * 33.33}%` }}
          onClick={() => onChange(option)}
          disabled={disabled}
        >
          {labels?.[option] || option}
        </button>
      ))}
    </div>
  );
}
