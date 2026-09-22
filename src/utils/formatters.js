/* =========================================================
   FORMATTERS

   Dates and numbers rendered the same way across every admin
   screen. Small, but the alternative is six pages each choosing a
   slightly different date format.
========================================================= */

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

/* "3 days ago" - for activity, where the exact minute is noise. */
export const formatRelative = (value) => {
  if (!value) {
    return "-";
  }

  const then = new Date(value).getTime();

  if (Number.isNaN(then)) {
    return "-";
  }

  const seconds = Math.round((Date.now() - then) / 1000);

  if (seconds < 60) return "just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.round(hours / 24);
  if (days < 31) return `${days} day${days === 1 ? "" : "s"} ago`;

  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;

  return `${Math.round(months / 12)} yr ago`;
};

export const formatNumber = (value) =>
  Number.isFinite(Number(value))
    ? Number(value).toLocaleString("en-IN")
    : "0";

/* Whether a date has passed - used for coupon expiry. */
export const isPast = (value) =>
  Boolean(value) && new Date(value).getTime() < Date.now();
