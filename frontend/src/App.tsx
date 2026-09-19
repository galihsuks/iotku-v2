import { RouterProvider } from "react-router-dom";
import Forbidden from "./components/templates/Forbidden";
import NotFound from "./components/templates/NotFound";
import InternalServerError from "./components/templates/InternalServerError";
import NetworkError from "./components/templates/NetworkError";
import { appRouter } from "./routes/router";
import { useHttpErrorActions, useHttpErrorStore } from "./store/httpErrorStore";

function App() {
  const kind = useHttpErrorStore((state) => state.kind);
  const { clearError } = useHttpErrorActions();

  if (kind === "forbidden") {
    return <Forbidden onReset={clearError} />;
  }

  if (kind === "not_found") {
    return <NotFound onReset={clearError} showHomeLink={false} />;
  }

  if (kind === "internal_server_error") {
    return <InternalServerError onReset={clearError} />;
  }

  if (kind === "network_error") {
    return <NetworkError onReset={clearError} />;
  }

  return <RouterProvider router={appRouter} />;
}

export default App;
