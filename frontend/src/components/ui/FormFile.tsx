import { Upload } from "lucide-react";
import { Controller, type Control, type FieldPath, type FieldValues, type RegisterOptions } from "react-hook-form";
import { cn } from "../../utils/cn";

interface FormFileProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string | null;
  className?: string;
  rules?: RegisterOptions<T, FieldPath<T>>;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
}

export const FormFile = <T extends FieldValues>({
  control,
  name,
  label = null,
  className,
  rules,
  accept,
  multiple = false,
  disabled = false,
}: FormFileProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => {
        const hasError = Boolean(fieldState.error?.message);
        const currentValue = field.value as FileList | File[] | null;
        const count = currentValue ? (Array.isArray(currentValue) ? currentValue.length : currentValue.length) : 0;

        return (
          <div className={cn("w-full", className)}>
            {label ? <p className="mb-1 text-sm font-medium text-dark-700">{label}</p> : null}

            <label
              className={cn(
                "flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-dark-300 bg-light-50 px-4 py-5 text-sm text-dark-700 transition hover:border-primary-400 hover:bg-primary-50",
                disabled ? "cursor-not-allowed opacity-60" : "",
              )}
            >
              <Upload className="h-4 w-4 text-primary-600" />
              <span>{count > 0 ? `${count} file selected` : "Click to upload file"}</span>
              <input
                type="file"
                accept={accept}
                multiple={multiple}
                disabled={disabled}
                className="hidden"
                onChange={(event) => {
                  field.onChange(event.target.files);
                }}
                onBlur={field.onBlur}
              />
            </label>

            {hasError ? <p className="mt-1 text-xs font-medium text-danger-600">{fieldState.error?.message}</p> : null}
          </div>
        );
      }}
    />
  );
};
