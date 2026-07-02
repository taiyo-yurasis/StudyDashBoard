"use client";

import { Pause, Play, RotateCcw, Square } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SubjectSelect } from "@/components/shared/SubjectSelect";
import type { StudyData, Subject } from "@/types/study";
import { formatDurationHms } from "@/utils/progress";

type StudyTimerProps = {
  data: StudyData;
};

export function StudyTimer({ data }: StudyTimerProps) {
  const [draftSubject, setDraftSubject] = useState<Subject>("英語");
  const [draftBookId, setDraftBookId] = useState("");
  const [draftMemo, setDraftMemo] = useState("");
  const [nowMs, setNowMs] = useState(Date.now());
  const [message, setMessage] = useState("");
  const activeTimer = data.activeTimer;
  const status = activeTimer?.status ?? "idle";
  const subject = activeTimer?.subject ?? draftSubject;
  const bookId = activeTimer?.bookId ?? draftBookId;
  const memo = activeTimer?.memo ?? draftMemo;

  const filteredBooks = useMemo(
    () => data.books.filter((book) => book.subject === subject),
    [data.books, subject]
  );
  const activeStartedAtMs = activeTimer?.activeStartedAt
    ? new Date(activeTimer.activeStartedAt).getTime()
    : null;
  const elapsedSeconds =
    activeTimer && status === "running" && activeStartedAtMs
      ? activeTimer.accumulatedSeconds + Math.max(0, Math.floor((nowMs - activeStartedAtMs) / 1000))
      : activeTimer?.accumulatedSeconds ?? 0;

  useEffect(() => {
    if (bookId && !filteredBooks.some((book) => book.id === bookId)) {
      if (activeTimer) {
        data.updateTimerDraft({ bookId: undefined });
      } else {
        setDraftBookId("");
      }
    }
  }, [activeTimer, bookId, data, filteredBooks]);

  useEffect(() => {
    if (status !== "running") {
      return;
    }

    const intervalId = window.setInterval(() => setNowMs(Date.now()), 500);
    return () => window.clearInterval(intervalId);
  }, [status]);

  const handleSubjectChange = (nextSubject: Subject) => {
    if (activeTimer) {
      data.updateTimerDraft({ subject: nextSubject, bookId: undefined });
      return;
    }

    setDraftSubject(nextSubject);
    setDraftBookId("");
  };

  const handleBookChange = (nextBookId: string) => {
    if (activeTimer) {
      data.updateTimerDraft({ bookId: nextBookId || undefined });
      return;
    }

    setDraftBookId(nextBookId);
  };

  const handleMemoChange = (nextMemo: string) => {
    if (activeTimer) {
      data.updateTimerDraft({ memo: nextMemo });
      return;
    }

    setDraftMemo(nextMemo);
  };

  const start = () => {
    const now = Date.now();
    setNowMs(now);
    setMessage("");
    data.startTimer({
      subject,
      bookId: bookId || undefined,
      memo
    });
  };

  const pause = () => {
    data.pauseTimer();
  };

  const resume = () => {
    const now = Date.now();
    setNowMs(now);
    data.resumeTimer();
  };

  const finish = () => {
    if (!activeTimer) {
      return;
    }

    data.finishTimer();
    setDraftSubject("英語");
    setDraftBookId("");
    setDraftMemo("");
    setMessage("学習記録を保存しました");
  };

  return (
    <section className="rounded-md border border-line bg-panel p-5 shadow-subtle">
      <div>
        <p className="text-sm font-medium text-muted">学習タイマー</p>
        <h2 className="mt-1 text-2xl font-semibold text-ink">科目ごとに時間を記録</h2>
      </div>

      <div className="mt-5 rounded-md border border-line bg-panelSoft px-4 py-6 text-center">
        <p className="text-sm font-medium text-muted">経過時間</p>
        <p className="mt-2 font-mono text-5xl font-semibold tabular-nums text-ink sm:text-6xl">
          {formatDurationHms(elapsedSeconds)}
        </p>
      </div>

      <div className="mt-5 grid gap-4">
        <SubjectSelect value={subject} onChange={handleSubjectChange} />
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted">教材</span>
          <select
            value={bookId}
            onChange={(event) => handleBookChange(event.target.value)}
            disabled={filteredBooks.length === 0}
            className="h-12 w-full rounded-md border border-line bg-panelSoft px-3 text-base text-ink outline-none focus:border-accent disabled:text-muted"
          >
            <option value="">教材なし</option>
            {filteredBooks.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted">メモ</span>
          <textarea
            value={memo}
            onChange={(event) => handleMemoChange(event.target.value)}
            placeholder="例: 長文読解を3題"
            rows={3}
            className="w-full resize-none rounded-md border border-line bg-panelSoft px-3 py-3 text-base text-ink outline-none placeholder:text-muted/65 focus:border-accent"
          />
        </label>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          type="button"
          onClick={start}
          disabled={status !== "idle"}
          className="flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-3 font-semibold text-surface disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Play size={18} aria-hidden />
          <span>開始</span>
        </button>
        <button
          type="button"
          onClick={pause}
          disabled={status !== "running"}
          className="flex h-12 items-center justify-center gap-2 rounded-md border border-line bg-panelSoft px-3 font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Pause size={18} aria-hidden />
          <span>一時停止</span>
        </button>
        <button
          type="button"
          onClick={resume}
          disabled={status !== "paused"}
          className="flex h-12 items-center justify-center gap-2 rounded-md border border-line bg-panelSoft px-3 font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-45"
        >
          <RotateCcw size={18} aria-hidden />
          <span>再開</span>
        </button>
        <button
          type="button"
          onClick={finish}
          disabled={status === "idle"}
          className="flex h-12 items-center justify-center gap-2 rounded-md border border-line bg-panelSoft px-3 font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Square size={18} aria-hidden />
          <span>終了</span>
        </button>
      </div>

      {message && <p className="mt-4 text-sm font-medium text-accent">{message}</p>}
    </section>
  );
}
