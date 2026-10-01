import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button, FormInput, Modal, Table, type TableColumn } from "../../components/ui";
import { DEFAULT_PAGE_SIZE } from "../../constants";
import { usePageTitle } from "../../hooks/usePageTitle";
import type { DropdownOption } from "../../interfaces/dropdown";
import type {
  SensorUnit,
  SensorUnitPayload,
  SensorValueOption,
  SensorValueType,
  SensorWidgetType,
} from "../../interfaces/sensor";
import {
  useCreateSensorUnitMutation,
  useDeleteSensorUnitMutation,
  useSensorUnitListQuery,
  useUpdateSensorUnitMutation,
} from "../../api/sensorUnit/sensorUnitQuery";
import { useNotificationStore } from "../../store/notifStore";
import { getApiErrorMessage } from "../../api/apiError";

type SensorUnitFormValues = Omit<SensorUnitPayload, "value_options"> & {
  value_options_json: string;
};

const valueTypeOptions: DropdownOption[] = [
  { label: "Number", value: "number" },
  { label: "String", value: "string" },
];

const widgetTypeOptions: DropdownOption[] = [
  { label: "Numeric Card", value: "numeric_card" },
  { label: "Chart", value: "chart" },
  { label: "Gauge", value: "gauge" },
  { label: "Switch", value: "switch" },
  { label: "Status", value: "status" },
];

const formatOptionsJson = (options?: SensorValueOption[]) => {
  if (!options?.length) return "";
  return JSON.stringify(options, null, 2);
};

const parseOptionsJson = (value: string): SensorValueOption[] => {
  const trimmed = value.trim();
  if (!trimmed) return [];
  const parsed = JSON.parse(trimmed) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Value options must be an array.");

  return parsed.map((item) => {
    if (!item || typeof item !== "object") {
      throw new Error("Each value option must be an object.");
    }
    const option = item as Record<string, unknown>;
    const label = String(option.label ?? "").trim();
    const optionValue = String(option.value ?? "").trim();
    if (!label || !optionValue) {
      throw new Error("Each value option must contain label and value.");
    }
    return { label, value: optionValue };
  });
};

export const AdminSensorUnitPage = () => {
  usePageTitle("Admin Sensor Unit");

  const queryClient = useQueryClient();
  const addToast = useNotificationStore((state) => state.addToast);
  const [page, setPage] = useState(1);
  const [formTarget, setFormTarget] = useState<SensorUnit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SensorUnit | null>(null);
  const [openFormModal, setOpenFormModal] = useState(false);
  const { data, isPending } = useSensorUnitListQuery({
    page,
    page_size: DEFAULT_PAGE_SIZE,
  });
  const createMutation = useCreateSensorUnitMutation();
  const updateMutation = useUpdateSensorUnitMutation();
  const deleteMutation = useDeleteSensorUnitMutation();
  const { control, handleSubmit, reset } = useForm<SensorUnitFormValues>({
    defaultValues: {
      name: "",
      unit: "",
      value_type: "string",
      widget_type: "switch",
      value_options_json: "",
    },
  });

  const closeFormModal = () => {
    setOpenFormModal(false);
    setFormTarget(null);
    reset({
      name: "",
      unit: "",
      value_type: "string",
      widget_type: "switch",
      value_options_json: "",
    });
  };

  useEffect(() => {
    if (!formTarget) return;

    reset({
      name: formTarget.name,
      unit: formTarget.unit,
      value_type: formTarget.value_type,
      widget_type: formTarget.widget_type,
      value_options_json: formatOptionsJson(formTarget.value_options),
    });
  }, [formTarget, reset]);

  const invalidateSensorUnitQueries = () => {
    void queryClient.invalidateQueries({ queryKey: ["sensor-unit"] });
    void queryClient.invalidateQueries({ queryKey: ["dropdown", "sensor-unit"] });
    void queryClient.invalidateQueries({ queryKey: ["sensor"] });
  };

  const openCreateForm = () => {
    setFormTarget(null);
    reset({
      name: "",
      unit: "",
      value_type: "string",
      widget_type: "switch",
      value_options_json: "",
    });
    setOpenFormModal(true);
  };

  const openEditForm = (sensorUnit: SensorUnit) => {
    setFormTarget(sensorUnit);
    setOpenFormModal(true);
  };

  const submitForm = (values: SensorUnitFormValues) => {
    let valueOptions: SensorValueOption[] = [];
    try {
      valueOptions = parseOptionsJson(values.value_options_json);
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Value options JSON is invalid.", "error");
      return;
    }

    const payload: SensorUnitPayload = {
      name: values.name,
      unit: values.unit,
      value_type: values.value_type as SensorValueType,
      widget_type: values.widget_type as SensorWidgetType,
      value_options: valueOptions,
    };

    if (formTarget) {
      updateMutation.mutate(
        { id: formTarget.id, payload },
        {
          onSuccess: (response) => {
            addToast(response.message, "success");
            invalidateSensorUnitQueries();
            closeFormModal();
          },
          onError: (error) => addToast(getApiErrorMessage(error), "error"),
        },
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: (response) => {
        addToast(response.message, "success");
        invalidateSensorUnitQueries();
        closeFormModal();
      },
      onError: (error) => addToast(getApiErrorMessage(error), "error"),
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: (response) => {
        addToast(response.message, "success");
        invalidateSensorUnitQueries();
        setDeleteTarget(null);
      },
      onError: (error) => addToast(getApiErrorMessage(error), "error"),
    });
  };

  const columns: TableColumn<SensorUnit>[] = [
    {
      key: "name",
      header: "Name",
      render: (item) => (
        <div>
          <p className="font-semibold text-dark-900">{item.name}</p>
          <p className="mt-1 text-xs text-dark-500">{item.unit}</p>
        </div>
      ),
    },
    {
      key: "value_type",
      header: "Value Type",
      render: (item) => item.value_type,
    },
    {
      key: "widget_type",
      header: "Widget",
      render: (item) => item.widget_type,
    },
    {
      key: "value_options",
      header: "Options",
      render: (item) =>
        item.value_options?.length
          ? item.value_options.map((option) => option.label).join(", ")
          : "-",
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (item) => (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="primary-outline"
            icon={Pencil}
            onClick={() => openEditForm(item)}
          />
          <Button
            type="button"
            variant="danger-outline"
            icon={Trash2}
            onClick={() => setDeleteTarget(item)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Admin Sensor Unit"
        subtitle="Manage sensor unit masters, dashboard widget types, and fixed command values."
        breadcrumbs={[
          { label: "Admin", route: undefined },
          { label: "Sensor Unit", route: undefined },
        ]}
        rightElement={
          <Button type="button" variant="primary" icon={Plus} onClick={openCreateForm}>
            Add Sensor Unit
          </Button>
        }
      />

      <Table
        columns={columns}
        data={data?.data ?? []}
        loading={isPending}
        emptyText="No sensor units available yet."
        pagination={data?.pagination}
        onPageChange={setPage}
      />

      <Modal
        open={openFormModal}
        onClose={closeFormModal}
        title={formTarget ? "Edit Sensor Unit" : "Add Sensor Unit"}
        subtitle="Use value options for switch or enum-like devices."
        footer={
          <div className="flex justify-end gap-3">
            <Button type="button" variant="light-outline" onClick={closeFormModal}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              loading={createMutation.isPending || updateMutation.isPending}
              onClick={handleSubmit(submitForm)}
            >
              Save
            </Button>
          </div>
        }
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(submitForm)}>
          <FormInput
            control={control}
            name="name"
            label="Name"
            rules={{ required: "Name is required." }}
          />
          <FormInput
            control={control}
            name="unit"
            label="Unit"
            rules={{ required: "Unit is required." }}
          />
          <FormInput
            control={control}
            name="value_type"
            label="Value Type"
            type="dropdown"
            dropdownOptions={valueTypeOptions}
            rules={{ required: "Value type is required." }}
          />
          <FormInput
            control={control}
            name="widget_type"
            label="Widget Type"
            type="dropdown"
            dropdownOptions={widgetTypeOptions}
            rules={{ required: "Widget type is required." }}
          />
          <div className="md:col-span-2">
            <FormInput
              control={control}
              name="value_options_json"
              label="Value Options JSON"
              type="textarea"
              placeholder='[{"label":"Open","value":"open"},{"label":"Close","value":"close"}]'
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Sensor Unit"
        subtitle="Sensor units cannot be deleted while they are still used by sensors."
        className="max-w-lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button type="button" variant="light-outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-dark-600">
          Delete <span className="font-semibold text-dark-900">{deleteTarget?.name}</span>?
        </p>
      </Modal>
    </>
  );
};

