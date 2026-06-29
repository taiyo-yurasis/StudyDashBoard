"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import type { StudyData } from "@/types/study";
import { formatLongJapaneseDate, todayKey } from "@/utils/date";

type StudyTimerProps = {
  data: StudyData;
};

export function StudyTimer({ data }: StudyTimerProps) {
  const [date, setDate] = useState(todayKey());
  const [hours, setHours] = useState("");

  useEffect(() => {
    const record = data.records.find((item) => item.date === date);
    setHours(record ? String(record.hours) : "");
  }, [data.records, date]);

  const save = () => {
    const numericHours = Math.max(0, Number(hours) || 0);
    data.setStudyHours(date, numericHours);
  };

  return (
    <section className="rounded-md border border-line bg-panel p-5 shadow-subtle">
      <div>
        <p className="text-sm font-medium text-muted">勉強時間記録</p>
        <h2 className="mt-1 text-2xl font-semibold text-ink">日ごとの時間</h2>
      </div>

      <div className="mt-5 grid gap-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted">日付</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-12 w-full rounded-md border border-line bg-panelSoft px-3 text-base text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted">勉強時間（時間）</span>
          <input
            type="number"
            min="0"
            step="0.5"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
            placeholder="例: 4.5"
            className="h-12 w-full rounded-md border border-line bg-panelSoft px-3 text-base text-ink outline-none placeholder:text-muted/65 focus:border-accent"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{formatLongJapaneseDate(date)}</p>
        <button
          type="button"
          onClick={save}
          className="flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-5 font-semibold text-surface"
        >
          <Save size={18} aria-hidden />
          <span>保存</span>
        </button>
      </div>
    </section>
  );
}
