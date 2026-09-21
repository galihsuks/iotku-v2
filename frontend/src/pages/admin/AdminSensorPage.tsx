import { PageHeader } from "../../components/layout/PageHeader";

export const AdminSensorPage = () => {
  return (
    <PageHeader
      title="Admin Sensor"
      subtitle="List seluruh sensor di database beserta owner, status, dan info perangkat."
      breadcrumbs={[
        { label: "Admin", route: undefined },
        { label: "Sensor", route: undefined },
      ]}
    />
  );
};

