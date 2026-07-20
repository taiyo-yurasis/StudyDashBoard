"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { SessionListItem } from "@/components/study/SessionListItem";
import type { StudyData } from "@/types/study";
import { formatJapaneseDate, todayKey } from "@/utils/date";
import { formatDurationHms, formatHours } from "@/utils/progress";

type StudyHistoryProps = {
  data: StudyData;
};

export function StudyHistory({ data }: StudyHistoryProps) {
  const today = todayKey();
  const sessions = data.studySessions
    .filter((session) => session.date === today)
    .sort((a, b) => b.startTime.localeCompare(a.startTime));
  const todaySessionSeconds = data.studySessions
    .filter((session) => session.date === today)
    .reduce((sum, session) => sum + session.durationSeconds, 0);
  const todayRecord = data.records.find((record) => record.date === today);
  const todayTotalSeconds =
    todaySessionSeconds > 0 ? todaySessionSeconds : Math.round((todayRecord?.hours ?? 0) * 3600);
  const legacyRecords = todayRecord ? [todayRecord] : [];
  const deleteSession = (id: string) => {
    if (window.confirm("この学習記録を削除しますか？")) {
      data.deleteStudySession(id);
    }
  };

  return (
    <section className="rounded-md border border-line bg-panel p-5 shadow-subtle">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">今日の記録</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">学習履歴</h2>
        </div>
        <p className="text-sm text-muted">今日の合計 {formatDurationHms(todayTotalSeconds)}</p>
      </div>

      <div className="mt-5 space-y-3">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <SessionListItem key={session.id} session={session} onDelete={deleteSession} />
          ))
        ) : legacyRecords.length > 0 ? (
          legacyRecords.map((record) => (
            <div
              key={record.date}
              className="flex items-center justify-between gap-4 rounded-md border border-line bg-panelSoft p-4"
            >
              <p className="font-medium text-ink">{formatJapaneseDate(record.date)}</p>
              <p className="text-xl font-semibold text-accent">{formatHours(record.hours)}</p>
            </div>
          ))
        ) : (
          <EmptyState
            title="学習記録はまだありません"
            description="今日はまだタイマーで記録した学習はありません。"
          />
        )}
      </div>
    </section>
  );
}
