import { useCallback, useState } from "react";
import { Cpu, KeyRound, Link2, Plus, RadioTower } from "lucide-react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { dropdownApi } from "../../../api/dropdown/dropdownApi";
import { queryKeys } from "../../../api/queryKeys";
import { useCreateSensorMutation, useJoinSensorMutation } from "../../../api/sensor/sensorQuery";
import { PageHeader } from "../../../components/layout/PageHeader";
import { Button, FormInput } from "../../../components/ui";
import type { DropdownOption } from "../../../interfaces/dropdown";
import type { SensorJoinPayload, SensorPayload } from "../../../interfaces/sensor";
import { cn } from "../../../utils/cn";
import { useNotificationStore } from "../../../store/notifStore";

type AddMode = "new" | "shared";

type NewSensorFormValues = Pick<SensorPayload, "label" | "passkey" | "unit_id">;
type SharedSensorFormValues = SensorJoinPayload;

const modeCards: Array<{
  mode: AddMode;
  title: string;
  description: string;
  icon: typeof Plus;
}> = [
  {
    mode: "new",
    title: "Perangkat Baru",
    description: "Buat sensor baru dengan akunmu sebagai owner perangkat.",
    icon: Plus,
  },
  {
    mode: "shared",
    title: "Perangkat Shared",
    description: "Gabung ke sensor yang sudah ada memakai kode sensor dan passkey.",
    icon: Link2,
  },
];

export const AddPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useNotificationStore();
  const [mode, setMode] = useState<AddMode>("new");
  const { mutate: createSensor, isPending: isCreateSensorPending } = useCreateSensorMutation();
  const { mutate: joinSensor, isPending: isJoinSensorPending } = useJoinSensorMutation();

  const {
    control: newSensorControl,
    handleSubmit: handleNewSensorSubmit,
    reset: resetNewSensorForm,
  } = useForm<NewSensorFormValues>({
    defaultValues: {
      label: "",
      unit_id: "",
      passkey: "",
    },
  });

  const {
    control: sharedSensorControl,
    handleSubmit: handleSharedSensorSubmit,
    reset: resetSharedSensorForm,
  } = useForm<SharedSensorFormValues>({
    defaultValues: {
      sensor_code: "",
      passkey: "",
    },
  });

  const loadSensorUnitOptions = useCallback(async (keywords: string): Promise<DropdownOption[]> => {
    const response = await dropdownApi.sensorUnit(keywords);
    return response.data ?? [];
  }, []);

  const refreshSensorQueries = (sensorId?: string) => {
    void queryClient.invalidateQueries({ queryKey: ["sensor"] });
    void queryClient.invalidateQueries({ queryKey: ["dropdown", "sensor"] });
    if (sensorId) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sensor.detail(sensorId) });
    }
  };

  const onCreateSensor = (values: NewSensorFormValues) => {
    createSensor(
      {
        label: values.label,
        unit_id: values.unit_id,
        passkey: values.passkey,
        shared_user_ids: [],
      },
      {
        onSuccess: (response) => {
          const sensorId = response.data?.id;
          refreshSensorQueries(sensorId);
          resetNewSensorForm();
          addToast(response.message || "Sensor created successfully.", "success");
          navigate(sensorId ? `/detail/${sensorId}` : "/");
        },
        onError: (error) => {
          addToast(error.message, "error");
        },
      },
    );
  };

  const onJoinSensor = (values: SharedSensorFormValues) => {
    joinSensor(values, {
      onSuccess: (response) => {
        const sensorId = response.data?.id;
        refreshSensorQueries(sensorId);
        resetSharedSensorForm();
        addToast(response.message || "Sensor joined successfully.", "success");
        navigate(sensorId ? `/detail/${sensorId}` : "/");
      },
      onError: (error) => {
        addToast(error.message, "error");
      },
    });
  };

  return (
    <>
      <PageHeader
        showGoBack
        title="Add Device"
        subtitle="Pilih hubungkan perangkat baru atau gabung ke perangkat yang sudah ada."
        breadcrumbs={[
          { label: "Main", route: "/" },
          { label: "Add Device", route: undefined },
        ]}
      />

      <section className="grid gap-4 md:grid-cols-2">
        {modeCards.map((item) => {
          const Icon = item.icon;
          const active = mode === item.mode;

          return (
            <button
              key={item.mode}
              type="button"
              onClick={() => setMode(item.mode)}
              className={cn(
                "rounded-2xl border bg-white p-6 text-left transition hover:border-primary-300 hover:shadow-sm",
                active ? "border-primary-300 ring-2 ring-primary-100" : "border-dark-200",
              )}
            >
              <Icon className={cn("h-7 w-7", active ? "text-primary-600" : "text-dark-500")} />
              <h2 className="mt-4 text-lg font-semibold text-dark-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-dark-500">{item.description}</p>
            </button>
          );
        })}
      </section>

      <section className="mt-5 rounded-2xl border border-dark-200 bg-white p-5 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.45)] sm:p-6">
        {mode === "new" ? (
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={handleNewSensorSubmit(onCreateSensor)}
          >
            <div className="md:col-span-2">
              <h2 className="text-base font-semibold text-dark-900">Detail Perangkat Baru</h2>
              <p className="mt-1 text-sm text-dark-500">
                Sensor akan otomatis terdaftar sebagai milik akun yang sedang login.
              </p>
            </div>
            <FormInput
              control={newSensorControl}
              name="label"
              label="Sensor Name"
              icon={RadioTower}
              placeholder="Living Room Temperature"
              rules={{ required: "Sensor name is required." }}
            />
            <FormInput
              control={newSensorControl}
              name="unit_id"
              label="Sensor Unit"
              type="dropdown"
              icon={Cpu}
              placeholder="Select sensor unit"
              loadDropdownOptions={loadSensorUnitOptions}
              rules={{ required: "Sensor unit is required." }}
            />
            <FormInput
              control={newSensorControl}
              name="passkey"
              label="Passkey"
              type="password"
              icon={KeyRound}
              placeholder="device-passkey"
              rules={{ required: "Passkey is required." }}
            />
            <div className="flex items-end justify-end md:col-span-2">
              <Button
                buttonType="submit"
                variant="primary"
                icon={Plus}
                loading={isCreateSensorPending}
              >
                Create Sensor
              </Button>
            </div>
          </form>
        ) : (
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={handleSharedSensorSubmit(onJoinSensor)}
          >
            <div className="md:col-span-2">
              <h2 className="text-base font-semibold text-dark-900">Gabung Perangkat Shared</h2>
              <p className="mt-1 text-sm text-dark-500">
                Masukkan kode sensor dan passkey dari owner untuk menambahkan akses ke akunmu.
              </p>
            </div>
            <FormInput
              control={sharedSensorControl}
              name="sensor_code"
              label="Sensor Code"
              icon={RadioTower}
              placeholder="00001"
              rules={{ required: "Sensor code is required." }}
            />
            <FormInput
              control={sharedSensorControl}
              name="passkey"
              label="Passkey"
              type="password"
              icon={KeyRound}
              placeholder="device-passkey"
              rules={{ required: "Passkey is required." }}
            />
            <div className="flex items-end justify-end md:col-span-2">
              <Button
                buttonType="submit"
                variant="primary"
                icon={Link2}
                loading={isJoinSensorPending}
              >
                Join Sensor
              </Button>
            </div>
          </form>
        )}
      </section>
    </>
  );
};
