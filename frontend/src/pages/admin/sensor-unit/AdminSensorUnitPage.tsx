import { Plus } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "../../../components/layout/PageHeader";
import { Button, Table } from "../../../components/ui";
import { useSensorUnitListQuery } from "../../../api/sensorUnit/sensorUnitQuery";
import { DEFAULT_PAGE_SIZE } from "../../../constants";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { SensorUnit } from "../../../interfaces/sensor";
import { useHasAccess } from "../../../store/accessControlStore";
import { SensorUnitDeleteModal } from "./components/SensorUnitDeleteModal";
import { SensorUnitFormModal } from "./components/SensorUnitFormModal";
import { getSensorUnitTableColumns } from "./components/SensorUnitTableColumns";

export const AdminSensorUnitPage = () => {
  usePageTitle("Admin Sensor Unit");

  const hasAccess = useHasAccess();
  const [page, setPage] = useState(1);
  const [formTarget, setFormTarget] = useState<SensorUnit | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SensorUnit | null>(null);
  const { data, isPending } = useSensorUnitListQuery({
    page,
    page_size: DEFAULT_PAGE_SIZE,
  });

  const openCreateForm = () => {
    setFormTarget(null);
    setIsFormModalOpen(true);
  };

  const openEditForm = (sensorUnit: SensorUnit) => {
    setFormTarget(sensorUnit);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setFormTarget(null);
    setIsFormModalOpen(false);
  };

  const columns = getSensorUnitTableColumns({
    hasAccess,
    onEdit: openEditForm,
    onDelete: setDeleteTarget,
  });

  return (
    <>
      <PageHeader
        title="Admin Sensor Unit"
        subtitle="Manage sensor unit masters, dashboard widget types, and fixed command values."
        breadcrumbs={[
          { label: "Admin", route: undefined },
          { label: "Sensor Unit", route: undefined },
        ]}
        rightElement={
          hasAccess("C") ? (
            <Button type="button" variant="primary" icon={Plus} onClick={openCreateForm}>
              Add Sensor Unit
            </Button>
          ) : undefined
        }
      />

      <Table
        columns={columns}
        data={data?.data ?? []}
        loading={isPending}
        emptyText="No sensor units available yet."
        pagination={data?.pagination}
        onPageChange={setPage}
      />

      <SensorUnitFormModal
        open={isFormModalOpen}
        target={formTarget}
        onClose={closeFormModal}
      />

      <SensorUnitDeleteModal
        open={deleteTarget !== null}
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
};
