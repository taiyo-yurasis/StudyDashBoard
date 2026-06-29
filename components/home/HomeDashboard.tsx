"use client";

import { Clock3 } from "lucide-react";
import { CountdownCard } from "@/components/home/CountdownCard";
import { TaskList } from "@/components/tasks/TaskList";
import type { StudyData } from "@/types/study";
import { formatHours } from "@/utils/progress";
import { formatLongJapaneseDate, todayKey } from "@/utils/date";

type HomeDashboardProps = {
  data: StudyData;
};

export function HomeDashboard({ data }: HomeDashboardProps) {
  const today = todayKey();
  const todayRecord = data.records.find((record) => record.date === today);
  const todayHours = todayRecord?.hours ?? 0;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <div className="space-y-5">
        <CountdownCard examDate={data.settings.examDate} />

        <section className="rounded-md border border-line bg-panel p-5 shadow-subtle">
          <p className="text-sm font-medium text-muted">今日の日付</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{formatLongJapaneseDate(today)}</p>
        </section>

        <section className="rounded-md border border-line bg-panel p-5 shadow-subtle">
          <div className="flex items-center gap-3 text-muted">
            <Clock3 size={20} aria-hidden />
            <span className="text-sm font-medium">今日の勉強時間</span>
          </div>
          <p className="mt-4 text-4xl font-semibold text-ink">{formatHours(todayHours)}</p>
        </section>
      </div>

      <TaskList data={data} date={today} title="今日のタスク" />
    </div>
  );
}
