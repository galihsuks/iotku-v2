import { Controller, type Control, type FieldPath, type FieldValues, type RegisterOptions } from "react-hook-form";
import { cn } from "../../utils/cn";

interface CheckboxOption {
  value: string;
  label: string;
}

interface FormCheckboxProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string | null;
  className?: string;
  options: CheckboxOption[];
  rules?: RegisterOptions<T, FieldPath<T>>;
  disabled?: boolean;
}

export const FormCheckbox = <T extends FieldValues>({
  control,
  name,
  label = null,
  className,
  options,
  rules,
  disabled = false,
}: FormCheckboxProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => {
        const values = Array.isArray(field.value) ? (field.value as string[]) : [];

        return (
          <div className={cn("w-full", className)}>
            {label ? <p className="mb-2 text-sm font-medium text-dark-700">{label}</p> : null}
            <div className="space-y-2">
              {options.map((option) => {
                const checked = values.includes(option.value);
                return (
                  <label key={option.value} className="flex items-center gap-2 text-sm text-dark-700">
                    <input
                      type="checkbox"
                      disabled={disabled}
                      checked={checked}
                      onChange={(event) => {
                        const next = event.target.checked
                          ? [...values, option.value]
                          : values.filter((item) => item !== option.value);
                        field.onChange(next);
                      }}
                      className="h-4 w-4 rounded border-dark-300 text-primary-600 focus:ring-primary-400"
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
            {fieldState.error?.message ? (
              <p className="mt-1 text-xs font-medium text-danger-600">{fieldState.error.message}</p>
            ) : null}
          </div>
        );
      }}
    />
  );
};
