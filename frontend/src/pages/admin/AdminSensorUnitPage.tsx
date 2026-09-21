import { PageHeader } from "../../components/layout/PageHeader";

export const AdminSensorUnitPage = () => {
  return (
    <PageHeader
      title="Admin Sensor Unit"
      subtitle="CRUD master unit sensor dan tipe widget dashboard."
      breadcrumbs={[
        { label: "Admin", route: undefined },
        { label: "Sensor Unit", route: undefined },
      ]}
    />
  );
};

