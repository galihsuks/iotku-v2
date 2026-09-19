export const nowSql = () => {
  const now = new Date();
  const jakarta = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${jakarta.getFullYear()}-${pad(jakarta.getMonth() + 1)}-${pad(jakarta.getDate())} ${pad(jakarta.getHours())}:${pad(jakarta.getMinutes())}:${pad(jakarta.getSeconds())}`;
};
