import { PageHeader } from "../../components/layout/PageHeader";
import { usePageTitle } from "../../hooks/usePageTitle";

export const AdminSensorPage = () => {
  usePageTitle("Admin Sensor");

  return (
    <PageHeader
      title="Admin Sensor"
      subtitle="List all sensors in the database with owner, status, and device information."
      breadcrumbs={[
        { label: "Admin", route: undefined },
        { label: "Sensor", route: undefined },
      ]}
    />
  );
};

