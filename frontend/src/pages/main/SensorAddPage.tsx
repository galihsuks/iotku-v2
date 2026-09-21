import { Link2, Plus } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui";

export const SensorAddPage = () => {
  return (
    <>
      <PageHeader
        showGoBack
        title="Add Sensor"
        subtitle="Pilih hubungkan perangkat baru atau gabung ke perangkat yang sudah ada."
        breadcrumbs={[
          { label: "Main", route: "/" },
          { label: "Add Sensor", route: undefined },
        ]}
      />

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-dark-200 bg-white p-6">
          <Plus className="h-7 w-7 text-primary-600" />
          <h2 className="mt-4 text-lg font-semibold text-dark-900">Perangkat Baru</h2>
          <p className="mt-2 text-sm leading-6 text-dark-500">
            Buat sensor baru dengan akunmu sebagai owner. Form detailnya akan kita lengkapi di tahap
            berikutnya.
          </p>
          <Button type="button" variant="primary" className="mt-5">
            Create New Sensor
          </Button>
        </div>

        <div className="rounded-2xl border border-dark-200 bg-white p-6">
          <Link2 className="h-7 w-7 text-primary-600" />
          <h2 className="mt-4 text-lg font-semibold text-dark-900">Perangkat Shared</h2>
          <p className="mt-2 text-sm leading-6 text-dark-500">
            Gabung ke sensor yang sudah ada memakai kode sensor dan passkey share.
          </p>
          <Button type="button" variant="primary-outline" className="mt-5">
            Join Existing Sensor
          </Button>
        </div>
      </section>
    </>
  );
};

