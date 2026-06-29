import { CalendarClock } from "lucide-react";
import { daysUntil, formatLongJapaneseDate } from "@/utils/date";

type CountdownCardProps = {
  examDate: string;
};

export function CountdownCard({ examDate }: CountdownCardProps) {
  const remaining = daysUntil(examDate);
  const label = remaining >= 0 ? `あと${remaining}日` : `${Math.abs(remaining)}日前`;

  return (
    <section className="rounded-md border border-line bg-panel p-5 shadow-subtle">
      <div className="flex items-center gap-3 text-muted">
        <CalendarClock size={20} aria-hidden />
        <span className="text-sm font-medium">共通テストまで</span>
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <p className="text-4xl font-semibold tracking-normal text-ink sm:text-5xl">{label}</p>
        <p className="pb-1 text-sm text-muted">{formatLongJapaneseDate(examDate)}</p>
      </div>
    </section>
  );
}
