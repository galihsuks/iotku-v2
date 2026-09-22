import { useCallback, useEffect } from "react";
import { Cpu, KeyRound, RadioTower, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { dropdownApi } from "../../../api/dropdown/dropdownApi";
import { queryKeys } from "../../../api/queryKeys";
import { useSensorDetailQuery, useUpdateSensorMutation } from "../../../api/sensor/sensorQuery";
import { PageHeader } from "../../../components/layout/PageHeader";
import InternalServerError from "../../../components/templates/InternalServerError";
import { Button, FormInput } from "../../../components/ui";
import type { DropdownOption } from "../../../interfaces/dropdown";
import type { SensorPayload } from "../../../interfaces/sensor";
import { useUser } from "../../../store/authStore";
import { useNotificationStore } from "../../../store/notifStore";

type SensorEditFormValues = Pick<SensorPayload, "label" | "passkey" | "unit_id">;

export const EditPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useUser();
  const { addToast } = useNotificationStore();
  const { data, isPending, error } = useSensorDetailQuery(id);
  const sensor = data?.data;
  const { mutate: updateSensor, isPending: isUpdatePending } = useUpdateSensorMutation();
  const { control, handleSubmit, reset } = useForm<SensorEditFormValues>({
    defaultValues: {
      label: "",
      unit_id: "",
      passkey: "",
    },
  });

  const isOwner = Boolean(sensor && user?.id === sensor.owner_user_id);

  useEffect(() => {
    if (!sensor) return;

    reset({
      label: sensor.label,
      unit_id: sensor.unit_id,
      passkey: sensor.passkey ?? "",
    });
  }, [reset, sensor]);

  const loadSensorUnitOptions = useCallback(
    async (keywords: string): Promise<DropdownOption[]> => {
      const response = await dropdownApi.sensorUnit(keywords);
      return response.data ?? [];
    },
    [],
  );

  const currentSensorUnitOption = sensor
    ? [{ value: sensor.unit_id, label: `${sensor.unit_name} (${sensor.unit})` }]
    : [];

  const onSubmit = (values: SensorEditFormValues) => {
    if (!id) return;

    updateSensor(
      {
        id,
        payload: {
          label: values.label,
          unit_id: values.unit_id,
          passkey: values.passkey?.trim() ? values.passkey : undefined,
        },
      },
      {
        onSuccess: (response) => {
          addToast(response.message || "Sensor updated successfully.", "success");
          void queryClient.invalidateQueries({ queryKey: ["sensor"] });
          void queryClient.invalidateQueries({ queryKey: ["dropdown", "sensor"] });
          void queryClient.invalidateQueries({ queryKey: queryKeys.sensor.detail(id) });
          navigate(`/detail/${id}`);
        },
        onError: (mutationError) => {
          addToast(mutationError.message, "error");
        },
      },
    );
  };

  if (error) return <InternalServerError />;

  return (
    <>
      <PageHeader
        showGoBack
        title={sensor?.label ? `Edit ${sensor.label}` : "Edit Sensor"}
        subtitle="Update nama, tipe unit, dan passkey sensor milikmu."
        breadcrumbs={[
          { label: "Main", route: "/" },
          { label: "Edit Sensor", route: undefined },
        ]}
      />

      {isPending || !sensor ? (
        <div className="rounded-2xl border border-dark-200 bg-white p-6 text-sm text-dark-500">
          Loading sensor...
        </div>
      ) : !isOwner ? (
        <div className="rounded-2xl border border-warning-200 bg-warning-50 p-6">
          <p className="font-semibold text-dark-900">Sensor shared tidak bisa diedit.</p>
          <p className="mt-2 text-sm text-dark-600">
            Hanya owner sensor yang bisa mengubah detail perangkat ini.
          </p>
        </div>
      ) : (
        <section className="rounded-2xl border border-dark-200 bg-white p-5 shadow-sm sm:p-6">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <FormInput
              control={control}
              name="label"
              label="Sensor Name"
              icon={RadioTower}
              placeholder="Living Room Temperature"
              rules={{ required: "Sensor name is required." }}
            />
            <FormInput
              control={control}
              name="unit_id"
              label="Sensor Unit"
              type="dropdown"
              icon={Cpu}
              placeholder="Select sensor unit"
              dropdownOptions={currentSensorUnitOption}
              loadDropdownOptions={loadSensorUnitOptions}
              rules={{ required: "Sensor unit is required." }}
            />
            <FormInput
              control={control}
              name="passkey"
              label="Passkey"
              type="password"
              icon={KeyRound}
              placeholder="device-passkey"
            />
            <div className="flex items-end justify-end md:col-span-2">
              <Button
                buttonType="submit"
                variant="primary"
                icon={Save}
                loading={isUpdatePending}
              >
                Save Sensor
              </Button>
            </div>
          </form>
        </section>
      )}
    </>
  );
};
