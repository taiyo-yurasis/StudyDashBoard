export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function calculateProgress(currentPage: number, totalPages: number): number {
  if (totalPages <= 0) {
    return 0;
  }

  return Math.round((clampNumber(currentPage, 0, totalPages) / totalPages) * 100);
}

export function formatHours(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) {
    return "0時間";
  }

  return Number.isInteger(hours) ? `${hours}時間` : `${hours.toFixed(1)}時間`;
}

export function formatDurationHms(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  return [hours, minutes, remainingSeconds].map((value) => String(value).padStart(2, "0")).join(":");
}
