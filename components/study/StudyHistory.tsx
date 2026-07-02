"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { Trash2 } from "lucide-react";
import type { StudyData } from "@/types/study";
import { formatJapaneseDate, todayKey } from "@/utils/date";
import { formatDurationHms, formatHours } from "@/utils/progress";

type StudyHistoryProps = {
  data: StudyData;
};

function formatClockTime(value: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function StudyHistory({ data }: StudyHistoryProps) {
  const today = todayKey();
  const sessions = [...data.studySessions]
    .sort((a, b) => b.startTime.localeCompare(a.startTime))
    .slice(0, 14);
  const todaySessionSeconds = data.studySessions
    .filter((session) => session.date === today)
    .reduce((sum, session) => sum + session.durationSeconds, 0);
  const todayRecord = data.records.find((record) => record.date === today);
  const todayTotalSeconds =
    todaySessionSeconds > 0 ? todaySessionSeconds : Math.round((todayRecord?.hours ?? 0) * 3600);
  const legacyRecords = [...data.records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14);
  const deleteSession = (id: string) => {
    if (window.confirm("この学習記録を削除しますか？")) {
      data.deleteStudySession(id);
    }
  };

  return (
    <section className="rounded-md border border-line bg-panel p-5 shadow-subtle">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">直近の記録</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">学習履歴</h2>
        </div>
        <p className="text-sm text-muted">今日の合計 {formatDurationHms(todayTotalSeconds)}</p>
      </div>

      <div className="mt-5 space-y-3">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <article key={session.id} className="rounded-md border border-line bg-panelSoft p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted">{formatJapaneseDate(session.date)}</p>
                  <h3 className="mt-1 truncate text-lg font-semibold text-ink">
                    {session.subject}
                    {session.bookTitle ? ` / ${session.bookTitle}` : ""}
                  </h3>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <p className="font-mono text-2xl font-semibold tabular-nums text-accent">
                    {formatDurationHms(session.durationSeconds)}
                  </p>
                  <button
                    type="button"
                    onClick={() => deleteSession(session.id)}
                    aria-label="学習記録を削除"
                    title="削除"
                    className="flex size-10 items-center justify-center rounded-md border border-line bg-panel text-muted transition hover:border-red-400 hover:text-red-300"
                  >
                    <Trash2 size={17} aria-hidden />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
                <span>
                  {formatClockTime(session.startTime)} - {formatClockTime(session.endTime)}
                </span>
                {session.memo && <span className="truncate">{session.memo}</span>}
              </div>
            </article>
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
            description="タイマーを開始して、終了するとここに履歴が表示されます。"
          />
        )}
      </div>
    </section>
  );
}
