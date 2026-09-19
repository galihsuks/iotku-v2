import { Outlet } from "react-router-dom";
import { AppSidebar } from "../components/layout/AppSidebar";

export const AppLayout = () => {
  return (
    <main className="min-h-screen bg-light-100">
      <div className="mx-auto flex max-w-[1400px] gap-0 md:gap-4 px-4 md:px-6 pb-4 md:pb-6 pt-0 md:pt-6">
        <AppSidebar />

        <section className="min-h-[calc(100svh-var(--spacing)*4)] md:min-h-[calc(100svh-var(--spacing)*12)] flex-1 flex flex-col">
          <div className="block md:hidden h-20 w-12" />
          <div className="flex-1 rounded-3xl border border-primary-100 bg-white p-6 md:p-8 shadow-[0_20px_50px_-35px_rgba(30,41,59,0.32)]">
            <Outlet />
          </div>
        </section>
      </div>
    </main>
  );
};
