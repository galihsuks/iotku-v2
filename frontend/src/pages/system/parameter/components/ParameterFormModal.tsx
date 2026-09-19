import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Button, FormInput, Modal } from "../../../../components/ui";
import {
  useCreateParameterMutation,
  useParameterDetailQuery,
  useUpdateParameterMutation,
} from "../../../../api/parameter/parameterQuery";
import { useApiFormError } from "../../../../hooks/useApiFormError";
import { queryKeys } from "../../../../api/queryKeys";
import { useNotificationStore } from "../../../../store/notifStore";
import type { DropdownOption } from "../../../../interfaces/dropdown";
import {
  parameterFormSchema,
  type ParameterFormSchemaType,
} from "../schema/ParameterFormSchema";

interface ParameterFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  parameterId?: string | null;
  onClose: () => void;
}

const DATATYPE_OPTIONS: DropdownOption[] = [
  { value: "string", label: "String" },
  { value: "number", label: "Number" },
  { value: "json", label: "JSON" },
  { value: "boolean", label: "Boolean" },
];

export const ParameterFormModal = ({
  open,
  mode,
  parameterId,
  onClose,
}: ParameterFormModalProps) => {
  const queryClient = useQueryClient();
  const { addToast } = useNotificationStore();
  const { mutate: createParameterMutation, isPending: isCreateParameterPending } =
    useCreateParameterMutation();
  const { mutate: updateParameterMutation, isPending: isUpdateParameterPending } =
    useUpdateParameterMutation();
  const { handleApiFormError } = useApiFormError({ logEvent: "parameter_form_submit_failed" });
  const { data: parameterDetailData, isPending: isParameterDetailPending } = useParameterDetailQuery(
    mode === "edit" ? (parameterId ?? "") : "",
  );

  const { control, handleSubmit, reset } = useForm<ParameterFormSchemaType>({
    resolver: zodResolver(parameterFormSchema),
    defaultValues: {
      key: "",
      value: "",
      datatype: "string",
    },
  });

  useEffect(() => {
    if (!open) return;

    if (mode === "create") {
      reset({
        key: "",
        value: "",
        datatype: "string",
      });
      return;
    }

    if (!parameterDetailData?.data) return;

    reset({
      key: parameterDetailData.data.key,
      value: parameterDetailData.data.value,
      datatype: parameterDetailData.data.datatype,
    });
  }, [mode, open, parameterDetailData?.data, reset]);

  const isSubmitPending = isCreateParameterPending || isUpdateParameterPending;

  const onSubmit = (values: ParameterFormSchemaType) => {
    const payload = {
      key: values.key,
      value: values.value,
      datatype: values.datatype,
    };

    if (mode === "create") {
      createParameterMutation(payload, {
        onSuccess: (response) => {
          addToast(response.message, "success");
          void queryClient.invalidateQueries({ queryKey: ["parameter"] });
          onClose();
        },
        onError: (error) => {
          handleApiFormError(error, {
            form_mode: mode,
            parameter_key: values.key,
          });
        },
      });
      return;
    }

    if (!parameterId) return;

    updateParameterMutation(
      { id: parameterId, payload },
      {
        onSuccess: (response) => {
          addToast(response.message, "success");
          void queryClient.invalidateQueries({ queryKey: ["parameter"] });
          void queryClient.invalidateQueries({ queryKey: queryKeys.parameter.detail(parameterId) });
          onClose();
        },
        onError: (error) => {
          handleApiFormError(error, {
            form_mode: mode,
            parameter_id: parameterId,
            parameter_key: values.key,
          });
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Create parameter" : "Edit parameter"}
      subtitle={
        mode === "create"
          ? "Create a new parameter for application configuration."
          : "Update the selected parameter configuration."
      }
      className="max-w-xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="light-outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" buttonType="submit" loading={isSubmitPending} onClick={handleSubmit(onSubmit)}>
            {mode === "create" ? "Save Parameter" : "Update Parameter"}
          </Button>
        </div>
      }
    >
      {mode === "edit" && isParameterDetailPending ? (
        <div className="space-y-3">
          <div className="h-11 rounded-xl bg-light-100" />
          <div className="h-11 rounded-xl bg-light-100" />
          <div className="h-11 rounded-xl bg-light-100" />
        </div>
      ) : (
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <FormInput control={control} name="key" label="Parameter Key" placeholder="skip_check_signature" />
          <FormInput
            control={control}
            name="datatype"
            label="Datatype"
            type="dropdown"
            dropdownOptions={DATATYPE_OPTIONS}
            placeholder="Select datatype"
          />
          <FormInput control={control} name="value" label="Value" placeholder="Enter parameter value" />
        </form>
      )}
    </Modal>
  );
};
