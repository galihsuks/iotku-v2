import { Controller, type Control, type FieldPath, type FieldValues, type RegisterOptions } from "react-hook-form";
import { cn } from "../../utils/cn";

interface RadioOption {
  value: string;
  label: string;
}

interface FormRadioProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string | null;
  className?: string;
  options: RadioOption[];
  rules?: RegisterOptions<T, FieldPath<T>>;
  disabled?: boolean;
}

export const FormRadio = <T extends FieldValues>({
  control,
  name,
  label = null,
  className,
  options,
  rules,
  disabled = false,
}: FormRadioProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <div className={cn("w-full", className)}>
          {label ? <p className="mb-2 text-sm font-medium text-dark-700">{label}</p> : null}
          <div className="space-y-2">
            {options.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm text-dark-700">
                <input
                  type="radio"
                  disabled={disabled}
                  checked={field.value === option.value}
                  onChange={() => field.onChange(option.value)}
                  className="h-4 w-4 border-dark-300 text-primary-600 focus:ring-primary-400"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {fieldState.error?.message ? <p className="mt-1 text-xs font-medium text-danger-600">{fieldState.error.message}</p> : null}
        </div>
      )}
    />
  );
};
