import { PageHeader } from "../../components/layout/PageHeader";

export const AdminDashboardPage = () => {
  return (
    <PageHeader
      title="Admin Dashboard"
      subtitle="Ringkasan seluruh sensor, device online/offline, readings, dan aktivitas WebSocket."
      breadcrumbs={[
        { label: "Admin", route: undefined },
        { label: "Dashboard", route: undefined },
      ]}
    />
  );
};

