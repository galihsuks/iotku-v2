import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

type CodeBlockProps = {
  label: string;
  language: string;
  value: string;
};

export const CodeBlock = ({ label, language, value }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-w-0 overflow-hidden rounded-md border border-dark-200 bg-dark-900">
      <div className="flex min-h-8 md:min-h-10 items-center justify-between gap-2 border-b border-white/10 px-3 text-[10px] md:text-xs text-dark-200">
        <span className="min-w-0 truncate font-medium">{label}</span>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-dark-400">{language}</span>
          <button
            type="button"
            onClick={() => void copy()}
            title={copied ? "Copied" : `Copy ${label}`}
            aria-label={copied ? "Copied" : `Copy ${label}`}
            className="grid h-6 w-6 md:h-8 md:w-8 place-items-center rounded text-dark-200 transition hover:bg-white/10 hover:text-white"
          >
            {copied ? (
              <Check className="h-3 w-3 md:h-4 md:w-4" />
            ) : (
              <Copy className="h-3 w-3 md:h-4 md:w-4" />
            )}
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-[10px] leading-5 md:text-xs md:leading-6 text-light-100">
        <code>{value}</code>
      </pre>
    </div>
  );
};
