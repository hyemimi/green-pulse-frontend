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

export function randomFebruary2024Date() {
  const day = randomInteger(1, 29);
  const hour = randomInteger(0, 23);
  const minute = randomInteger(0, 59);
  const second = randomInteger(0, 59);

  // UTC에 9시간을 빼서 저장하면 어느 환경에서 실행해도 서울 시간으로 같은 값이 표시됩니다.
  return new Date(Date.UTC(2024, 1, day, hour - 9, minute, second));
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

function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
