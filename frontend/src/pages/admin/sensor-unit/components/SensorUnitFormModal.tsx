import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Button, FormInput, Modal } from "../../../../components/ui";
import type { DropdownOption } from "../../../../interfaces/dropdown";
import type {
  SensorUnit,
  SensorUnitPayload,
  SensorValueOption,
  SensorValueType,
  SensorWidgetType,
} from "../../../../interfaces/sensor";
import {
  useCreateSensorUnitMutation,
  useUpdateSensorUnitMutation,
} from "../../../../api/sensorUnit/sensorUnitQuery";
import { getApiErrorMessage } from "../../../../api/apiError";
import { useNotificationStore } from "../../../../store/notifStore";

type SensorUnitFormValues = Omit<SensorUnitPayload, "value_options"> & {
  value_options_json: string;
};

interface SensorUnitFormModalProps {
  open: boolean;
  target: SensorUnit | null;
  onClose: () => void;
}

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

const defaultValues: SensorUnitFormValues = {
  name: "",
  unit: "",
  value_type: "string",
  widget_type: "switch",
  value_options_json: "",
};

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

export const SensorUnitFormModal = ({ open, target, onClose }: SensorUnitFormModalProps) => {
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((state) => state.addToast);
  const createMutation = useCreateSensorUnitMutation();
  const updateMutation = useUpdateSensorUnitMutation();
  const { control, handleSubmit, reset } = useForm<SensorUnitFormValues>({
    defaultValues,
  });

  const invalidateSensorUnitQueries = () => {
    void queryClient.invalidateQueries({ queryKey: ["sensor-unit"] });
    void queryClient.invalidateQueries({ queryKey: ["dropdown", "sensor-unit"] });
    void queryClient.invalidateQueries({ queryKey: ["sensor"] });
  };

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const onSubmit = (values: SensorUnitFormValues) => {
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

    if (target) {
      updateMutation.mutate(
        { id: target.id, payload },
        {
          onSuccess: (response) => {
            addToast(response.message, "success");
            invalidateSensorUnitQueries();
            handleClose();
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
        handleClose();
      },
      onError: (error) => addToast(getApiErrorMessage(error), "error"),
    });
  };

  useEffect(() => {
    if (!open) return;

    if (!target) {
      reset(defaultValues);
      return;
    }

    reset({
      name: target.name,
      unit: target.unit,
      value_type: target.value_type,
      widget_type: target.widget_type,
      value_options_json: formatOptionsJson(target.value_options),
    });
  }, [open, reset, target]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={target ? "Edit Sensor Unit" : "Add Sensor Unit"}
      subtitle="Use value options for switch or enum-like devices."
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="light-outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            loading={createMutation.isPending || updateMutation.isPending}
            onClick={handleSubmit(onSubmit)}
          >
            Save
          </Button>
        </div>
      }
    >
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
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
  );
};
