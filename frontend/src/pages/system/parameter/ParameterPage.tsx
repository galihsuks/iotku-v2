import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PageHeader } from "../../../components/layout/PageHeader";
import { Button, FilterGrid, FormInput, Table } from "../../../components/ui";
import { useParameterListQuery } from "../../../api/parameter/parameterQuery";
import { DEFAULT_PAGE_SIZE } from "../../../constants";
import { useDebounce } from "../../../hooks/useDebounce";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { Parameter } from "../../../interfaces/parameter";
import InternalServerError from "../../../components/templates/InternalServerError";
import { ParameterDeleteModal } from "./components/ParameterDeleteModal";
import { ParameterFormModal } from "./components/ParameterFormModal";
import { useHasAccess } from "../../../store/accessControlStore";
import { getParameterTableColumns } from "./components/ParameterTableColumns";

interface ParameterFilterSchemaType {
  keywords: string;
}

export const ParameterPage = () => {
  usePageTitle("Parameter Management");

  const hasAccess = useHasAccess();
  const [page, setPage] = useState(1);
  const [parameterFormMode, setParameterFormMode] = useState<"create" | "edit" | null>(null);
  const [selectedParameterId, setSelectedParameterId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    key: string;
    datatype: string;
  } | null>(null);
  const { control, watch } = useForm<ParameterFilterSchemaType>({
    defaultValues: {
      keywords: "",
    },
  });
  const keywords = watch("keywords");
  const debouncedKeywords = useDebounce(keywords, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedKeywords]);

  const {
    data: parameterListData,
    isPending: isParameterListPending,
    error: parameterListError,
  } = useParameterListQuery({
    page,
    page_size: DEFAULT_PAGE_SIZE,
    keywords: debouncedKeywords || undefined,
  });

  const parameters = parameterListData?.data ?? [];
  const pagination = parameterListData?.pagination;

  const onOpenCreateParameter = () => {
    setSelectedParameterId(null);
    setParameterFormMode("create");
  };

  const onOpenEditParameter = (parameter: Parameter) => {
    setSelectedParameterId(parameter.id);
    setParameterFormMode("edit");
  };

  const onCloseParameterForm = () => {
    setSelectedParameterId(null);
    setParameterFormMode(null);
  };

  const columns = getParameterTableColumns({
    hasAccess,
    onEdit: onOpenEditParameter,
    onDelete: (parameter) =>
      setDeleteTarget({
        id: parameter.id,
        key: parameter.key,
        datatype: parameter.datatype,
      }),
  });

  if (parameterListError) return <InternalServerError />;

  return (
    <>
      <PageHeader
        title="Parameter Management"
        subtitle="Manage application parameters and lightweight configuration values."
        breadcrumbs={[
          { label: "System", route: undefined },
          { label: "Parameter", route: undefined },
        ]}
        rightElement={
          hasAccess("C") ? (
            <Button type="button" variant="primary" icon={Plus} onClick={onOpenCreateParameter}>
              Add Parameter
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
          placeholder="Search parameter by key, value, or datatype..."
        />
      </FilterGrid>

      <Table
        columns={columns}
        data={parameters}
        loading={isParameterListPending}
        emptyText="No parameters available yet."
        pagination={pagination}
        onPageChange={setPage}
      />

      <ParameterFormModal
        open={parameterFormMode !== null}
        mode={parameterFormMode ?? "create"}
        parameterId={selectedParameterId}
        onClose={onCloseParameterForm}
      />

      <ParameterDeleteModal
        open={deleteTarget !== null}
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
};
