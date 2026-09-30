import { PageHeader } from "../../components/layout/PageHeader";
import { usePageTitle } from "../../hooks/usePageTitle";

export const AdminDashboardPage = () => {
  usePageTitle("Admin Dashboard");

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

