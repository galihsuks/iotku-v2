import { RotateCcw, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "../../../components/layout/PageHeader";
import {
  Button,
  FilterGrid,
  FormInput,
  Modal,
  Table,
} from "../../../components/ui";
import { useClearLogMutation, useLogListQuery } from "../../../api/log/logQuery";
import { DEFAULT_PAGE_SIZE } from "../../../constants";
import { useDebounce } from "../../../hooks/useDebounce";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { DropdownOption } from "../../../interfaces/dropdown";
import type { LogLevel } from "../../../interfaces/log";
import { useNotificationStore } from "../../../store/notifStore";
import { useApiFormError } from "../../../hooks/useApiFormError";
import InternalServerError from "../../../components/templates/InternalServerError";
import { useHasAccess } from "../../../store/accessControlStore";
import { getLogTableColumns } from "./components/LogTableColumns";

interface LogFilterSchemaType {
  keywords: string;
  date: string;
  start_time: string;
  end_time: string;
  level: LogLevel | "";
}

const LOG_LEVEL_OPTIONS: DropdownOption[] = [
  { value: "", label: "All levels" },
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
];

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const LogPage = () => {
  usePageTitle("Log Monitoring");

  const hasAccess = useHasAccess();
  const queryClient = useQueryClient();
  const { addToast } = useNotificationStore();
  const { control, watch } = useForm<LogFilterSchemaType>({
    defaultValues: {
      keywords: "",
      date: getTodayDate(),
      start_time: "",
      end_time: "",
      level: "",
    },
  });
  const keywords = watch("keywords");
  const date = watch("date");
  const startTime = watch("start_time");
  const endTime = watch("end_time");
  const level = watch("level");
  const debouncedKeywords = useDebounce(keywords, 300);
  const [page, setPage] = useState(1);
  const [openClearModal, setOpenClearModal] = useState(false);
  const { handleApiFormError } = useApiFormError({ logEvent: "log_clear_failed" });
  const { mutate: clearLogMutation, isPending: isClearLogPending } = useClearLogMutation();

  useEffect(() => {
    setPage(1);
  }, [date, debouncedKeywords, endTime, level, startTime]);

  const {
    data: logListData,
    isPending: isLogListPending,
    error: logListError,
  } = useLogListQuery({
    page,
    page_size: DEFAULT_PAGE_SIZE,
    date: date || undefined,
    end_time: endTime || undefined,
    keywords: debouncedKeywords || undefined,
    level: level || undefined,
    start_time: startTime || undefined,
  });

  const logs = logListData?.data ?? [];
  const pagination = logListData?.pagination;

  const onClearLogs = () => {
    clearLogMutation(
      {
        date: date || undefined,
        end_time: endTime || undefined,
        keywords: debouncedKeywords || undefined,
        level: level || undefined,
        start_time: startTime || undefined,
      },
      {
        onSuccess: (response) => {
          addToast(response.message, "success");
          void queryClient.invalidateQueries({ queryKey: ["log"] });
          setOpenClearModal(false);
        },
        onError: (error) => {
          handleApiFormError(error, {
            action: "clear_logs",
          });
        },
      },
    );
  };

  const columns = getLogTableColumns();

  if (logListError) return <InternalServerError />;

  return (
    <>
      <PageHeader
        title="Log Monitoring"
        subtitle="Review frontend and backend log records captured by the base application."
        breadcrumbs={[
          { label: "System", route: undefined },
          { label: "Logs", route: undefined },
        ]}
        rightElement={
          hasAccess("D") ? (
            <Button
              type="button"
              variant="danger"
              icon={Trash2}
              onClick={() => setOpenClearModal(true)}
            >
              Clear Logs
            </Button>
          ) : undefined
        }
      />

      <FilterGrid>
        <FormInput
          control={control}
          name="keywords"
          type="text"
          icon={Search}
          placeholder="Search logs by message, context, or IP address..."
        />
        <FormInput control={control} name="date" type="date" placeholder="Select date" />
        <FormInput control={control} name="start_time" type="time" placeholder="Start time" />
        <FormInput control={control} name="end_time" type="time" placeholder="End time" />
        <FormInput
          control={control}
          name="level"
          type="dropdown"
          placeholder="Filter by level"
          dropdownOptions={LOG_LEVEL_OPTIONS}
        />
      </FilterGrid>

      <Table
        columns={columns}
        data={logs}
        loading={isLogListPending}
        emptyText="No logs available yet."
        showNumber={false}
        pagination={pagination}
        onPageChange={setPage}
      />

      <Modal
        open={openClearModal}
        onClose={() => setOpenClearModal(false)}
        title="Clear logs"
        subtitle="This action removes log records that match the current filter."
        className="max-w-lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button type="button" variant="light-outline" onClick={() => setOpenClearModal(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={isClearLogPending}
              onClick={onClearLogs}
            >
              Clear Logs
            </Button>
          </div>
        }
      >
        <div className="rounded-2xl border border-warning-200 bg-warning-50 p-4">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-100 text-warning-700">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-dark-900">
                You are about to clear the filtered log entries.
              </p>
              <p className="mt-1 text-sm text-dark-600">
                Current filter uses date <span className="font-medium">{date || "-"}</span>
                {startTime ? ` from ${startTime}` : ""}
                {endTime ? ` until ${endTime}` : ""}
                {level ? ` with level ${level}` : ""}.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
