export function toIsoString(value?: Date | string | null) {
  if (!value) return undefined;
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return undefined;
    return value.toISOString();
  }
  if (typeof value === "string") {
    const d = new Date(value);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString();
  }
  return undefined;
}
