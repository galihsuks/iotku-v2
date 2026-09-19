import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Clock3,
  Eye,
  EyeOff,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import { useDebounce } from "../../hooks/useDebounce";
import type { DropdownOption } from "../../interfaces/dropdown";
import { cn } from "../../utils/cn";

type InputKind =
  | "text"
  | "number"
  | "currency"
  | "password"
  | "email"
  | "textarea"
  | "dropdown"
  | "date"
  | "time"
  | "datetime";

const EMPTY_DROPDOWN_OPTIONS: DropdownOption[] = [];

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string | null;
  type?: InputKind;
  icon?: LucideIcon | null;
  className?: string;
  placeholder?: string | null;
  rules?: RegisterOptions<T, FieldPath<T>>;
  disabled?: boolean;
  dropdownOptions?: DropdownOption[];
  loadDropdownOptions?: (keywords: string) => Promise<DropdownOption[]>;
}

const inputBaseClass =
  "h-9 sm:h-11 w-full rounded-xl border border-dark-200 bg-white px-3.5 text-xs sm:text-sm text-dark-800 outline-none transition placeholder:text-dark-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-200";

const pad2 = (n: number) => String(n).padStart(2, "0");

const formatDateValue = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const formatTimeValue = (hours: number, minutes: number) => `${pad2(hours)}:${pad2(minutes)}`;

const getOrdinalSuffix = (day: number) => {
  const mod100 = day % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";

  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

const formatDisplayDate = (value: string) => {
  const [year, month, day] = value.split("-").map((part) => Number.parseInt(part, 10));

  if (!year || !month || !day) {
    return value;
  }

  const date = new Date(year, month - 1, day);
  const monthLabel = date.toLocaleString("en-US", { month: "short" });

  return `${monthLabel} ${day}${getOrdinalSuffix(day)}, ${year}`;
};

const formatDisplayDatetime = (value: string) => {
  const [datePart, timePart = "00:00"] = value.split(" ");

  if (!datePart) {
    return value;
  }

  return `${formatDisplayDate(datePart)} ${timePart}`;
};

const formatDisplayCurrency = (value: string) => {
  const digitsOnly = value.replace(/[^\d]/g, "");

  if (!digitsOnly) {
    return "";
  }

  return new Intl.NumberFormat("id-ID").format(Number(digitsOnly));
};

const parseDateValue = (value: string) => {
  const [year, month, day] = value.split("-").map((part) => Number.parseInt(part, 10));

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseTimeValue = (value: string) => {
  const [hoursPart = "00", minutesPart = "00"] = value.split(":");
  const hours = Number.parseInt(hoursPart, 10);
  const minutes = Number.parseInt(minutesPart, 10);

  return {
    hours: Number.isNaN(hours) ? 0 : Math.min(23, Math.max(0, hours)),
    minutes: Number.isNaN(minutes) ? 0 : Math.min(59, Math.max(0, minutes)),
  };
};

const getErrorText = (error?: unknown) => {
  if (
    typeof error === "object" &&
    error &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return null;
};

export const FormInput = <T extends FieldValues>({
  control,
  name,
  label = null,
  type = "text",
  icon: Icon = null,
  className,
  placeholder = null,
  rules,
  disabled = false,
  dropdownOptions,
  loadDropdownOptions,
}: FormInputProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const [dynamicDropdownOptions, setDynamicDropdownOptions] = useState<DropdownOption[]>([]);
  const [openDatePanel, setOpenDatePanel] = useState(false);
  const [openTimePanel, setOpenTimePanel] = useState(false);
  const [openDatetimePanel, setOpenDatetimePanel] = useState(false);
  const [panelMonth, setPanelMonth] = useState(() => new Date());
  const panelRef = useRef<HTMLDivElement | null>(null);
  const debouncedDropdownSearch = useDebounce(dropdownSearch, 300);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpenDropdown(false);
        setOpenDatePanel(false);
        setOpenTimePanel(false);
        setOpenDatetimePanel(false);
      }
    };
    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!loadDropdownOptions || !openDropdown) return;

    const fetchDropdownOptions = async () => {
      const next = await loadDropdownOptions(debouncedDropdownSearch);
      setDynamicDropdownOptions(next);
    };

    void fetchDropdownOptions();
  }, [debouncedDropdownSearch, loadDropdownOptions, openDropdown]);

  const calendarCells = useMemo(() => {
    const first = new Date(panelMonth.getFullYear(), panelMonth.getMonth(), 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(panelMonth.getFullYear(), panelMonth.getMonth() + 1, 0).getDate();
    const cells: Array<Date | null> = [];
    for (let i = 0; i < startDay; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(panelMonth.getFullYear(), panelMonth.getMonth(), day));
    }
    return cells;
  }, [panelMonth]);

  const staticDropdownOptions = dropdownOptions ?? EMPTY_DROPDOWN_OPTIONS;
  const filteredStaticDropdownOptions = useMemo(() => {
    const normalizedKeywords = dropdownSearch.trim().toLowerCase();

    if (!normalizedKeywords) {
      return staticDropdownOptions;
    }

    return staticDropdownOptions.filter((option) =>
      option.label.toLowerCase().includes(normalizedKeywords),
    );
  }, [dropdownSearch, staticDropdownOptions]);

  const activeDropdownOptions = loadDropdownOptions
    ? dynamicDropdownOptions.length > 0 || debouncedDropdownSearch !== ""
      ? dynamicDropdownOptions
      : staticDropdownOptions
    : filteredStaticDropdownOptions;
  const selectedDropdownOptions = useMemo(() => {
    const optionMap = new Map<string, DropdownOption>();

    staticDropdownOptions.forEach((option) => {
      optionMap.set(option.value, option);
    });

    dynamicDropdownOptions.forEach((option) => {
      optionMap.set(option.value, option);
    });

    return Array.from(optionMap.values());
  }, [dynamicDropdownOptions, staticDropdownOptions]);

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => {
        const errorText = getErrorText(fieldState.error);
        const stringValue = field.value ? String(field.value) : "";
        const selectedDropdownLabel =
          selectedDropdownOptions.find((item) => item.value === stringValue)?.label ?? "";
        const syncPanelMonthFromStringValue = () => {
          const datePart = stringValue.includes(" ") ? stringValue.split(" ")[0] : stringValue;
          const parsedDate = parseDateValue(datePart);

          if (parsedDate) {
            setPanelMonth(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1));
            return;
          }

          setPanelMonth(new Date());
        };

        const renderTextInput = () => {
          if (type === "textarea") {
            return (
              <div className="relative">
                {Icon ? (
                  <Icon className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-dark-400" />
                ) : null}
                <textarea
                  id={name}
                  value={stringValue}
                  placeholder={placeholder ?? ""}
                  disabled={disabled}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(event.target.value)}
                  className={cn(
                    "min-h-28 w-full rounded-xl border border-dark-200 bg-white px-3.5 py-3 text-xs sm:text-sm text-dark-800 outline-none transition placeholder:text-dark-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-200",
                    Icon ? "pl-10" : "",
                  )}
                />
              </div>
            );
          }

          const actualType =
            type === "password"
              ? showPassword
                ? "text"
                : "password"
              : type === "currency"
                ? "text"
                : type;
          const displayValue =
            type === "currency" ? formatDisplayCurrency(stringValue) : stringValue;
          return (
            <div className="relative">
              {Icon ? (
                <Icon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-dark-400" />
              ) : null}
              <input
                id={name}
                type={actualType}
                inputMode={type === "number" || type === "currency" ? "decimal" : undefined}
                value={displayValue}
                placeholder={placeholder ?? ""}
                disabled={disabled}
                onBlur={field.onBlur}
                onChange={(event) => {
                  let nextValue = event.target.value;
                  if (type === "currency") {
                    nextValue = nextValue.replace(/[^\d]/g, "");
                  }
                  field.onChange(nextValue);
                }}
                className={cn(
                  inputBaseClass,
                  Icon ? "pl-10" : "",
                  type === "password" ? "pr-11" : "",
                  className,
                )}
              />
              {type === "password" ? (
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-dark-500 hover:text-dark-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              ) : null}
            </div>
          );
        };

        const renderDropdown = () => (
          <div ref={panelRef} className="relative">
            <button
              type="button"
              disabled={disabled}
              className={cn(
                inputBaseClass,
                "flex items-center justify-between gap-2 text-left",
                !selectedDropdownLabel ? "text-dark-400" : "",
                className,
              )}
              onClick={() => setOpenDropdown((prev) => !prev)}
            >
              <span>{selectedDropdownLabel || placeholder || "Select option"}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-dark-500 transition-transform",
                  openDropdown ? "rotate-180" : "",
                )}
              />
            </button>
            {openDropdown ? (
              <div className="absolute z-40 mt-2 w-full rounded-xl border border-dark-200 bg-white p-2 shadow-lg">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-dark-400" />
                  <input
                    value={dropdownSearch}
                    onChange={(event) => setDropdownSearch(event.target.value)}
                    className="h-10 w-full rounded-lg border border-dark-200 pl-9 pr-8 text-xs sm:text-sm outline-none focus:border-primary-400"
                    placeholder="Search..."
                  />
                  {dropdownSearch ? (
                    <button
                      type="button"
                      className="absolute top-1/2 right-2 -translate-y-1/2 text-dark-400"
                      onClick={() => setDropdownSearch("")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
                <div className="mt-2 max-h-56 overflow-auto">
                  {activeDropdownOptions.length === 0 ? (
                    <p className="px-2 py-3 text-xs text-dark-500">No data found.</p>
                  ) : (
                    activeDropdownOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={cn(
                          "block w-full rounded-lg px-2 py-2 text-left text-xs sm:text-sm hover:bg-primary-50",
                          option.value === stringValue
                            ? "bg-primary-50 text-primary-700"
                            : "text-dark-700",
                        )}
                        onClick={() => {
                          field.onChange(option.value);
                          setOpenDropdown(false);
                          setDropdownSearch("");
                        }}
                      >
                        {option.label}
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>
        );

        const renderDatePanel = () => (
          <div ref={panelRef} className="relative">
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                syncPanelMonthFromStringValue();
                setOpenDatePanel((prev) => !prev);
              }}
              className={cn(
                inputBaseClass,
                "flex items-center justify-between text-left",
                className,
              )}
            >
              <span className={stringValue ? "text-dark-800" : "text-dark-400"}>
                {stringValue ? formatDisplayDate(stringValue) : placeholder || "Select date"}
              </span>
              <CalendarDays className="h-4 w-4 text-dark-500" />
            </button>
            {openDatePanel ? (
              <div className="absolute z-40 mt-2 w-full rounded-xl border border-dark-200 bg-white p-3 shadow-lg">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-xs hover:bg-dark-100"
                    onClick={() =>
                      setPanelMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                    }
                  >
                    Prev
                  </button>
                  <p className="text-xs sm:text-sm font-semibold text-dark-700">
                    {panelMonth.toLocaleString("en-US", { month: "long", year: "numeric" })}
                  </p>
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-xs hover:bg-dark-100"
                    onClick={() =>
                      setPanelMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                    }
                  >
                    Next
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-dark-500">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className="py-1">
                      {day}
                    </div>
                  ))}
                  {calendarCells.map((cell, index) =>
                    cell ? (
                      <button
                        key={`${cell.toISOString()}-${index}`}
                        type="button"
                        className={cn(
                          "rounded-md py-1 text-xs sm:text-sm hover:bg-primary-100",
                          formatDateValue(cell) === stringValue
                            ? "bg-primary-600 text-white hover:bg-primary-600"
                            : "",
                        )}
                        onClick={() => {
                          field.onChange(formatDateValue(cell));
                          setOpenDatePanel(false);
                        }}
                      >
                        {cell.getDate()}
                      </button>
                    ) : (
                      <div key={`empty-${index}`} />
                    ),
                  )}
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-xs text-dark-500 hover:bg-dark-100 hover:text-dark-700"
                    onClick={() => {
                      field.onChange("");
                      setOpenDatePanel(false);
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        );

        const hourOptions = Array.from({ length: 24 }, (_, index) => pad2(index));
        const minuteOptions = Array.from({ length: 60 }, (_, index) => pad2(index));
        const currentTimeParts = parseTimeValue(stringValue);

        const renderTimePanel = (forDatetime = false) => (
          <div
            className={forDatetime ? "mt-2" : "relative"}
            ref={forDatetime ? undefined : panelRef}
          >
            {!forDatetime ? (
              <button
                type="button"
                disabled={disabled}
                onClick={() => setOpenTimePanel((prev) => !prev)}
                className={cn(
                  inputBaseClass,
                  "flex items-center justify-between text-left",
                  className,
                )}
              >
                <span className={stringValue ? "text-dark-800" : "text-dark-400"}>
                  {stringValue || placeholder || "Select time"}
                </span>
                <Clock3 className="h-4 w-4 text-dark-500" />
              </button>
            ) : null}

            {(forDatetime || openTimePanel) && (
              <div
                className={cn(
                  forDatetime ? "" : "absolute z-40 mt-2 w-full",
                  "rounded-xl border border-dark-200 bg-white p-2 shadow-lg",
                )}
              >
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-dark-100 p-2">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-dark-500">
                      Hour
                    </p>
                    <div className="hide-scrollbar max-h-44 overflow-y-auto">
                      {hourOptions.map((hour) => (
                        <button
                          key={hour}
                          type="button"
                          className={cn(
                            "block w-full rounded-md px-2 py-1.5 text-left text-xs sm:text-sm hover:bg-primary-50",
                            currentTimeParts.hours === Number(hour)
                              ? "bg-primary-100 text-primary-700"
                              : "text-dark-700",
                          )}
                          onClick={() => {
                            field.onChange(formatTimeValue(Number(hour), currentTimeParts.minutes));
                          }}
                        >
                          {hour}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-dark-100 p-2">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-dark-500">
                      Minute
                    </p>
                    <div className="hide-scrollbar max-h-44 overflow-y-auto">
                      {minuteOptions.map((minute) => (
                        <button
                          key={minute}
                          type="button"
                          className={cn(
                            "block w-full rounded-md px-2 py-1.5 text-left text-xs sm:text-sm hover:bg-primary-50",
                            currentTimeParts.minutes === Number(minute)
                              ? "bg-primary-100 text-primary-700"
                              : "text-dark-700",
                          )}
                          onClick={() => {
                            field.onChange(formatTimeValue(currentTimeParts.hours, Number(minute)));
                            setOpenTimePanel(false);
                          }}
                        >
                          {minute}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {!forDatetime ? (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      className="rounded-md px-2 py-1 text-xs text-dark-500 hover:bg-dark-100 hover:text-dark-700"
                      onClick={() => {
                        field.onChange("");
                        setOpenTimePanel(false);
                      }}
                    >
                      Reset
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        );

        const renderDatetime = () => (
          <div ref={panelRef} className="relative">
            <button
              type="button"
              disabled={disabled}
              className={cn(
                inputBaseClass,
                "flex items-center justify-between text-left",
                className,
              )}
              onClick={() => {
                syncPanelMonthFromStringValue();
                setOpenDatetimePanel((prev) => !prev);
              }}
            >
              <span className={stringValue ? "text-dark-800" : "text-dark-400"}>
                {stringValue
                  ? formatDisplayDatetime(stringValue)
                  : placeholder || "Select date & time"}
              </span>
              <CalendarDays className="h-4 w-4 text-dark-500" />
            </button>
            {openDatetimePanel ? (
              <div className="absolute z-40 mt-2 w-full rounded-xl border border-dark-200 bg-white p-3 shadow-lg">
                {(() => {
                  const [, datetimeTime = "00:00"] = stringValue.includes(" ")
                    ? stringValue.split(" ")
                    : ["", "00:00"];
                  const currentDatetimeTimeParts = parseTimeValue(datetimeTime);

                  return (
                    <>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          className="rounded-md px-2 py-1 text-xs hover:bg-dark-100"
                          onClick={() =>
                            setPanelMonth(
                              (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                            )
                          }
                        >
                          Prev
                        </button>
                        <p className="text-xs sm:text-sm font-semibold text-dark-700">
                          {panelMonth.toLocaleString("en-US", { month: "long", year: "numeric" })}
                        </p>
                        <button
                          type="button"
                          className="rounded-md px-2 py-1 text-xs hover:bg-dark-100"
                          onClick={() =>
                            setPanelMonth(
                              (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                            )
                          }
                        >
                          Next
                        </button>
                      </div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-dark-500">
                        Date
                      </p>
                      <div className="grid grid-cols-7 gap-1 text-center text-xs text-dark-500">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                          <div key={day} className="py-1">
                            {day}
                          </div>
                        ))}
                        {calendarCells.map((cell, index) =>
                          cell ? (
                            <button
                              key={`${cell.toISOString()}-${index}`}
                              type="button"
                              className={cn(
                                "rounded-md py-1 text-xs sm:text-sm hover:bg-primary-100",
                                stringValue.startsWith(formatDateValue(cell))
                                  ? "bg-primary-600 text-white hover:bg-primary-600"
                                  : "",
                              )}
                              onClick={() => {
                                const currentTime = stringValue.includes(" ")
                                  ? stringValue.split(" ")[1]
                                  : "00:00";
                                field.onChange(`${formatDateValue(cell)} ${currentTime}`);
                              }}
                            >
                              {cell.getDate()}
                            </button>
                          ) : (
                            <div key={`empty-dt-${index}`} />
                          ),
                        )}
                      </div>
                      <p className="mt-3 mb-2 text-xs font-semibold uppercase tracking-wider text-dark-500">
                        Time
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-xl border border-dark-100 p-2">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-dark-500">
                            Hour
                          </p>
                          <div className="hide-scrollbar max-h-44 overflow-y-auto">
                            {hourOptions.map((hour) => (
                              <button
                                key={`datetime-hour-${hour}`}
                                type="button"
                                className={cn(
                                  "block w-full rounded-md px-2 py-1.5 text-left text-xs sm:text-sm hover:bg-primary-50",
                                  currentDatetimeTimeParts.hours === Number(hour)
                                    ? "bg-primary-100 text-primary-700"
                                    : "text-dark-700",
                                )}
                                onClick={() => {
                                  const currentDate = stringValue.includes(" ")
                                    ? stringValue.split(" ")[0]
                                    : formatDateValue(new Date());
                                  field.onChange(
                                    `${currentDate} ${formatTimeValue(Number(hour), currentDatetimeTimeParts.minutes)}`,
                                  );
                                }}
                              >
                                {hour}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-xl border border-dark-100 p-2">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-dark-500">
                            Minute
                          </p>
                          <div className="hide-scrollbar max-h-44 overflow-y-auto">
                            {minuteOptions.map((minute) => (
                              <button
                                key={`datetime-minute-${minute}`}
                                type="button"
                                className={cn(
                                  "block w-full rounded-md px-2 py-1.5 text-left text-xs sm:text-sm hover:bg-primary-50",
                                  currentDatetimeTimeParts.minutes === Number(minute)
                                    ? "bg-primary-100 text-primary-700"
                                    : "text-dark-700",
                                )}
                                onClick={() => {
                                  const currentDate = stringValue.includes(" ")
                                    ? stringValue.split(" ")[0]
                                    : formatDateValue(new Date());
                                  field.onChange(
                                    `${currentDate} ${formatTimeValue(currentDatetimeTimeParts.hours, Number(minute))}`,
                                  );
                                  setOpenDatetimePanel(false);
                                }}
                              >
                                {minute}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          className="rounded-md px-2 py-1 text-xs text-dark-500 hover:bg-dark-100 hover:text-dark-700"
                          onClick={() => {
                            field.onChange("");
                            setOpenDatetimePanel(false);
                          }}
                        >
                          Reset
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : null}
          </div>
        );

        return (
          <div className={cn("w-full", className)}>
            {label ? (
              <label
                htmlFor={name}
                className="mb-1 block text-xs sm:text-sm font-medium text-dark-700"
              >
                {label}
              </label>
            ) : null}

            {type === "dropdown"
              ? renderDropdown()
              : type === "date"
                ? renderDatePanel()
                : type === "time"
                  ? renderTimePanel()
                  : type === "datetime"
                    ? renderDatetime()
                    : renderTextInput()}

            {errorText ? (
              <p className="mt-1 text-xs font-medium text-danger-600">{errorText}</p>
            ) : null}
          </div>
        );
      }}
    />
  );
};
