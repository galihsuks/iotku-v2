import { useParams } from "react-router-dom";
import { PageHeader } from "../../components/layout/PageHeader";

export const SensorEditPage = () => {
  const { id } = useParams();

  return (
    <>
      <PageHeader
        showGoBack
        title="Edit Sensor"
        subtitle="Halaman ini khusus sensor milik user login. Form lengkapnya akan mengikuti pola modal/form system page."
        breadcrumbs={[
          { label: "Main", route: "/" },
          { label: "Edit Sensor", route: undefined },
        ]}
      />
      <div className="rounded-2xl border border-dark-200 bg-white p-6 text-sm text-dark-500">
        Editing sensor: {id}
      </div>
    </>
  );
};

