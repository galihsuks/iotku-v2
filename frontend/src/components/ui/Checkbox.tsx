import { cn } from "../../utils/cn";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string | null;
  disabled?: boolean;
  className?: string;
}

export const Checkbox = ({
  checked,
  onChange,
  label,
  description = null,
  disabled = false,
  className,
}: CheckboxProps) => {
  return (
    <label
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-dark-200 bg-white px-4 py-3 text-sm transition",
        checked ? "border-primary-300 bg-primary-50/40" : "hover:border-primary-200 hover:bg-primary-50/20",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-dark-300 text-primary-600 focus:ring-primary-400"
      />
      <span className="min-w-0">
        <span className="block font-medium text-dark-800">{label}</span>
        {description ? <span className="mt-1 block text-dark-500">{description}</span> : null}
      </span>
    </label>
  );
};
