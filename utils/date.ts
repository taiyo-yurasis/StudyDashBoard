export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function formatJapaneseDate(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(date);
}

export function formatLongJapaneseDate(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(date);
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function daysUntil(dateKey: string): number {
  const start = parseDateKey(todayKey()).getTime();
  const target = parseDateKey(dateKey).getTime();
  return Math.ceil((target - start) / 86_400_000);
}

export function getMonthDays(year: number, monthIndex: number): Array<string | null> {
  const first = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const leading = first.getDay();
  const days: Array<string | null> = Array.from({ length: leading }, () => null);

  for (let day = 1; day <= lastDay; day += 1) {
    days.push(toDateKey(new Date(year, monthIndex, day)));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

export function monthLabel(year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long"
  }).format(new Date(year, monthIndex, 1));
}
