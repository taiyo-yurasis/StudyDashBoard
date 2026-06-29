"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import type { StudyData } from "@/types/study";
import { formatJapaneseDate } from "@/utils/date";
import { formatHours } from "@/utils/progress";

type StudyHistoryProps = {
  data: StudyData;
};

export function StudyHistory({ data }: StudyHistoryProps) {
  const records = [...data.records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14);
  const total = records.reduce((sum, record) => sum + record.hours, 0);

  return (
    <section className="rounded-md border border-line bg-panel p-5 shadow-subtle">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">直近の記録</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">勉強履歴</h2>
        </div>
        <p className="text-sm text-muted">表示分 合計 {formatHours(total)}</p>
      </div>

      <div className="mt-5 space-y-3">
        {records.length === 0 ? (
          <EmptyState title="勉強時間の記録はまだありません" description="今日の時間を入力するとここに履歴が表示されます。" />
        ) : (
          records.map((record) => (
            <div
              key={record.date}
              className="flex items-center justify-between gap-4 rounded-md border border-line bg-panelSoft p-4"
            >
              <p className="font-medium text-ink">{formatJapaneseDate(record.date)}</p>
              <p className="text-xl font-semibold text-accent">{formatHours(record.hours)}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
