import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/layout/PageHeader";
import { FilterGrid, FormInput, Table } from "../../../components/ui";
import InternalServerError from "../../../components/templates/InternalServerError";
import { useAdminSensorListQuery } from "../../../api/sensor/sensorQuery";
import { DEFAULT_PAGE_SIZE } from "../../../constants";
import { useDebounce } from "../../../hooks/useDebounce";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useSensorSocket } from "../../../hooks/useSensorSocket";
import type { Sensor } from "../../../interfaces/sensor";
import {
  useDeviceStatusBySensor,
  useLatestReadingsBySensor,
  useRealtimeConnection,
} from "../../../store/realtimeStore";
import { getAdminSensorTableColumns } from "./components/AdminSensorTableColumns";

interface AdminSensorFilterSchemaType {
  keywords: string;
}

export const AdminDashboardPage = () => {
  usePageTitle("Admin Dashboard");

  const navigate = useNavigate();
  const isConnected = useRealtimeConnection();
  const latestReadingsBySensor = useLatestReadingsBySensor();
  const deviceStatusBySensor = useDeviceStatusBySensor();
  const [page, setPage] = useState(1);
  const { control, watch } = useForm<AdminSensorFilterSchemaType>({
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
    data: sensorListData,
    isPending,
    error,
  } = useAdminSensorListQuery({
    page,
    page_size: DEFAULT_PAGE_SIZE,
    keywords: debouncedKeywords || undefined,
  });
  const sensors = sensorListData?.data ?? [];
  const sensorCodes = useMemo(() => sensors.map((sensor) => sensor.code), [sensors]);

  useSensorSocket(sensorCodes);

  const columns = getAdminSensorTableColumns({
    deviceStatusBySensor,
    latestReadingsBySensor,
    onDetail: (sensor: Sensor) =>
      navigate(`/a/dashboard/detail/${sensor.id}`, {
        state: {
          backTo: "/a/dashboard",
          backLabel: "Admin Dashboard",
        },
      }),
  });

  if (error) return <InternalServerError />;

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Monitor every registered device and its realtime state."
        breadcrumbs={[
          { label: "Admin", route: undefined },
          { label: "Dashboard", route: undefined },
        ]}
        badges={[
          {
            text: isConnected ? "Realtime Online" : "Realtime Offline",
            variant: isConnected ? "success" : "light",
          },
        ]}
      />

      <FilterGrid>
        <FormInput
          control={control}
          name="keywords"
          type="text"
          icon={Search}
          placeholder="Search devices by code, label, unit, or owner..."
        />
      </FilterGrid>

      <Table
        columns={columns}
        data={sensors}
        loading={isPending}
        emptyText="No devices available yet."
        pagination={sensorListData?.pagination}
        onPageChange={setPage}
      />
    </>
  );
};
