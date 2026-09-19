export const getBearerToken = (header?: string) => {
  if (!header) return "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? "";
};
