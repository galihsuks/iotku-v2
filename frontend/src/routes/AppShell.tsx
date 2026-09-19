import { Outlet } from "react-router-dom";
import { ToastContainer } from "../components/ui/ToastContainer";

export const AppShell = () => {
  return (
    <>
      <ToastContainer />
      <Outlet />
    </>
  );
};
