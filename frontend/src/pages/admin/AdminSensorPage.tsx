import { PageHeader } from "../../components/layout/PageHeader";

export const AdminSensorPage = () => {
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

