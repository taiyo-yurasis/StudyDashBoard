"use client";

import { Pause, Play, RotateCcw, Square } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SubjectSelect } from "@/components/shared/SubjectSelect";
import type { StudyData, Subject } from "@/types/study";
import { toDateKey } from "@/utils/date";
import { formatDurationHms } from "@/utils/progress";

type StudyTimerProps = {
  data: StudyData;
};

type TimerStatus = "idle" | "running" | "paused";

export function StudyTimer({ data }: StudyTimerProps) {
  const [subject, setSubject] = useState<Subject>("英語");
  const [bookId, setBookId] = useState("");
  const [memo, setMemo] = useState("");
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [startTime, setStartTime] = useState<string | null>(null);
  const [activeStartedAt, setActiveStartedAt] = useState<number | null>(null);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0);
  const [nowMs, setNowMs] = useState(Date.now());
  const [message, setMessage] = useState("");

  const filteredBooks = useMemo(
    () => data.books.filter((book) => book.subject === subject),
    [data.books, subject]
  );
  const selectedBook = filteredBooks.find((book) => book.id === bookId);
  const elapsedSeconds =
    status === "running" && activeStartedAt
      ? accumulatedSeconds + Math.floor((nowMs - activeStartedAt) / 1000)
      : accumulatedSeconds;

  useEffect(() => {
    if (bookId && !filteredBooks.some((book) => book.id === bookId)) {
      setBookId("");
    }
  }, [bookId, filteredBooks]);

  useEffect(() => {
    if (status !== "running") {
      return;
    }

    const intervalId = window.setInterval(() => setNowMs(Date.now()), 500);
    return () => window.clearInterval(intervalId);
  }, [status]);

  const start = () => {
    const now = new Date();
    setStartTime(now.toISOString());
    setActiveStartedAt(now.getTime());
    setNowMs(now.getTime());
    setAccumulatedSeconds(0);
    setMessage("");
    setStatus("running");
  };

  const pause = () => {
    setAccumulatedSeconds(elapsedSeconds);
    setActiveStartedAt(null);
    setStatus("paused");
  };

  const resume = () => {
    const now = Date.now();
    setActiveStartedAt(now);
    setNowMs(now);
    setStatus("running");
  };

  const finish = () => {
    if (!startTime) {
      return;
    }

    const end = new Date();
    const durationSeconds =
      status === "running" && activeStartedAt
        ? accumulatedSeconds + Math.floor((end.getTime() - activeStartedAt) / 1000)
        : accumulatedSeconds;
    const trimmedMemo = memo.trim();

    data.addStudySession({
      date: toDateKey(new Date(startTime)),
      subject,
      bookId: selectedBook?.id,
      bookTitle: selectedBook?.title,
      startTime,
      endTime: end.toISOString(),
      durationSeconds,
      memo: trimmedMemo || undefined
    });

    setStatus("idle");
    setStartTime(null);
    setActiveStartedAt(null);
    setAccumulatedSeconds(0);
    setMemo("");
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
        <SubjectSelect value={subject} onChange={setSubject} disabled={status !== "idle"} />
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted">教材</span>
          <select
            value={bookId}
            onChange={(event) => setBookId(event.target.value)}
            disabled={status !== "idle" || filteredBooks.length === 0}
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
            onChange={(event) => setMemo(event.target.value)}
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
