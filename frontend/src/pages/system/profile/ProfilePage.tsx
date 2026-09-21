import { PageHeader } from "../../../components/layout/PageHeader";

export const ProfilePage = () => {
  return (
    <PageHeader
      title="Profile"
      subtitle="Kelola informasi akun, password, dan preferensi user login."
      breadcrumbs={[
        { label: "System", route: undefined },
        { label: "Profile", route: undefined },
      ]}
    />
  );
};

