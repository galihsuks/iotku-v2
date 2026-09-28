import { PageHeader } from "../../components/layout/PageHeader";

export const AdminDashboardPage = () => {
  return (
    <PageHeader
      title="Admin Dashboard"
        subtitle="Summary of all sensors, online/offline devices, readings, and WebSocket activity."
      breadcrumbs={[
        { label: "Admin", route: undefined },
        { label: "Dashboard", route: undefined },
      ]}
    />
  );
};

