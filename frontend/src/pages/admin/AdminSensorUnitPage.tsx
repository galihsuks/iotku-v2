import { PageHeader } from "../../components/layout/PageHeader";
import { usePageTitle } from "../../hooks/usePageTitle";

export const AdminSensorUnitPage = () => {
  usePageTitle("Admin Sensor Unit");

  return (
    <PageHeader
      title="Admin Sensor Unit"
      subtitle="Manage sensor unit masters and dashboard widget types."
      breadcrumbs={[
        { label: "Admin", route: undefined },
        { label: "Sensor Unit", route: undefined },
      ]}
    />
  );
};

