"use client";

import { Trash2 } from "lucide-react";
import type { StudySession } from "@/types/study";
import { formatClockTime, formatJapaneseDate } from "@/utils/date";
import { formatDurationHms } from "@/utils/progress";

type SessionListItemProps = {
  session: StudySession;
  showDate?: boolean;
  onDelete?: (id: string) => void;
};

export function SessionListItem({ session, showDate = false, onDelete }: SessionListItemProps) {
  return (
    <article className="rounded-md border border-line bg-panelSoft p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {showDate && <p className="text-sm font-medium text-muted">{formatJapaneseDate(session.date)}</p>}
          <h3 className={`${showDate ? "mt-1" : ""} truncate text-lg font-semibold text-ink`}>
            {session.subject}
            {session.bookTitle ? ` / ${session.bookTitle}` : ""}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <p className="font-mono text-2xl font-semibold tabular-nums text-accent">
            {formatDurationHms(session.durationSeconds)}
          </p>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(session.id)}
              aria-label="学習記録を削除"
              title="削除"
              className="flex size-10 items-center justify-center rounded-md border border-line bg-panel text-muted transition hover:border-red-400 hover:text-red-300"
            >
              <Trash2 size={17} aria-hidden />
            </button>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
        <span>
          {formatClockTime(session.startTime)} - {formatClockTime(session.endTime)}
        </span>
        {session.memo && <span className="truncate">{session.memo}</span>}
      </div>
    </article>
  );
}
