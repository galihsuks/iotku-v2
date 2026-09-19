import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { queryClient } from "./lib/queryClient";
import { sendFrontendErrorLog } from "./utils/frontendErrorLog";

window.addEventListener("error", (event) => {
  void sendFrontendErrorLog("uncaught_error", {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

window.addEventListener("unhandledrejection", (event) => {
  void sendFrontendErrorLog("unhandled_rejection", {
    reason: typeof event.reason === "string" ? event.reason : JSON.stringify(event.reason),
  });
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
