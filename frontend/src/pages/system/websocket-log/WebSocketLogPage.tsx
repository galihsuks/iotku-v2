import { PageHeader } from "../../../components/layout/PageHeader";

export const WebSocketLogPage = () => {
  return (
    <PageHeader
      title="WebSocket Log"
      subtitle="Pantau log koneksi, error, dan aktivitas realtime WebSocket."
      breadcrumbs={[
        { label: "System", route: undefined },
        { label: "WebSocket Log", route: undefined },
      ]}
    />
  );
};

