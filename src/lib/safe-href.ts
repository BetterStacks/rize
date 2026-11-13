/**
 * A safe outbound href for a user-entered link, or null.
 * Accepts http(s) URLs and bare domains ("example.com/me" becomes https://...);
 * anything else (javascript:, data:, plain words) is dropped.
 */
export const safeHref = (url?: string | null): string | null => {
  const value = url?.trim();
  if (!value) return null;
  if (/^https?:\/\/\S+$/i.test(value)) return value;
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(value)) return `https://${value}`;
  return null;
};
