export const RouteLoader = () => {
  return (
    <div className="min-h-[40svh] rounded-3xl border border-primary-100 bg-white/80 p-6 shadow-sm">
      <div className="space-y-4">
        <div className="h-4 w-28 rounded-full bg-primary-100" />
        <div className="h-10 w-72 max-w-full rounded-2xl bg-light-100" />
        <div className="h-4 w-96 max-w-full rounded-full bg-light-100" />
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-20 rounded-2xl border border-light-200 bg-light-50" />
          ))}
        </div>
      </div>
    </div>
  );
};
