export function formatClock(date = new Date()) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  })
    .format(date)
    .replace(/\. /g, ".")
    .replace(".", ".")
    .concat(" GMT+9");
}

export function formatYearMonth(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    timeZone: "Asia/Seoul",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "2024";
  const month = parts.find((part) => part.type === "month")?.value ?? "02";

  return `${year}-${month}`;
}

export function displayYearMonth(value: string) {
  return value.replace("-", ".");
}

export function formatTimeInSeoul(value: string | Date) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

export function shiftIsoTimestamp(value: string, offsetMs: number) {
  return new Date(new Date(value).getTime() + offsetMs).toISOString();
}
