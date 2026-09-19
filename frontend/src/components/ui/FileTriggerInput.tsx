import { Upload } from "lucide-react";
import { type ChangeEvent } from "react";
import { cn } from "../../utils/cn";

interface FileTriggerInputProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  accept?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  title: string;
  description: string;
  buttonLabel: string;
  loadingLabel?: string;
  loading?: boolean;
  className?: string;
}

export const FileTriggerInput = ({
  inputRef,
  accept,
  onChange,
  title,
  description,
  buttonLabel,
  loadingLabel = "Uploading...",
  loading = false,
  className,
}: FileTriggerInputProps) => {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-primary-200 bg-primary-50/40 p-4",
        className,
      )}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onChange} />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-dark-900">{title}</p>
          <p className="mt-1 text-sm text-dark-500">{description}</p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-2xl border border-primary-200 bg-white px-4 py-2.5 text-sm font-semibold text-primary-700 transition hover:border-primary-300 hover:bg-primary-100",
            loading ? "cursor-wait opacity-70" : "",
          )}
        >
          <Upload className="h-4 w-4" />
          <span className="text-nowrap">{loading ? loadingLabel : buttonLabel}</span>
        </button>
      </div>
    </div>
  );
};
