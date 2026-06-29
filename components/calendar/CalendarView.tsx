"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { TaskList } from "@/components/tasks/TaskList";
import type { StudyData } from "@/types/study";
import { formatHours } from "@/utils/progress";
import { formatLongJapaneseDate, getMonthDays, monthLabel, parseDateKey, todayKey, toDateKey } from "@/utils/date";

type CalendarViewProps = {
  data: StudyData;
};

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

export function CalendarView({ data }: CalendarViewProps) {
  const today = todayKey();
  const current = parseDateKey(today);
  const [year, setYear] = useState(current.getFullYear());
  const [monthIndex, setMonthIndex] = useState(current.getMonth());
  const [selectedDate, setSelectedDate] = useState(today);

  const days = useMemo(() => getMonthDays(year, monthIndex), [year, monthIndex]);
  const selectedRecord = data.records.find((record) => record.date === selectedDate);
  const selectedTasks = data.tasks.filter((task) => task.date === selectedDate);

  const moveMonth = (amount: number) => {
    const next = new Date(year, monthIndex + amount, 1);
    setYear(next.getFullYear());
    setMonthIndex(next.getMonth());
    setSelectedDate(toDateKey(next));
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.7fr)]">
      <section className="rounded-md border border-line bg-panel p-5 shadow-subtle">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            className="grid h-10 w-10 place-items-center rounded-md border border-line text-muted hover:text-ink"
            aria-label="前の月"
            title="前の月"
          >
            <ChevronLeft size={20} aria-hidden />
          </button>
          <h2 className="text-xl font-semibold text-ink sm:text-2xl">{monthLabel(year, monthIndex)}</h2>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            className="grid h-10 w-10 place-items-center rounded-md border border-line text-muted hover:text-ink"
            aria-label="次の月"
            title="次の月"
          >
            <ChevronRight size={20} aria-hidden />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-2 text-center text-sm text-muted">
          {weekdays.map((weekday) => (
            <div key={weekday} className="py-2 font-medium">
              {weekday}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((dateKey, index) => {
            const record = dateKey ? data.records.find((item) => item.date === dateKey) : undefined;
            const taskCount = dateKey ? data.tasks.filter((task) => task.date === dateKey).length : 0;
            const isToday = dateKey === today;
            const isSelected = dateKey === selectedDate;

            return (
              <button
                key={`${dateKey ?? "blank"}-${index}`}
                type="button"
                disabled={!dateKey}
                onClick={() => dateKey && setSelectedDate(dateKey)}
                className={`min-h-20 rounded-md border p-2 text-left transition-colors sm:min-h-24 ${
                  isSelected
                    ? "border-accent bg-accent/15"
                    : "border-line bg-panelSoft hover:border-muted"
                } ${!dateKey ? "opacity-0" : ""}`}
              >
                {dateKey && (
                  <>
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-sm font-semibold ${isToday ? "text-accent" : "text-ink"}`}>
                        {parseDateKey(dateKey).getDate()}
                      </span>
                      {taskCount > 0 && <span className="text-xs text-muted">{taskCount}件</span>}
                    </div>
                    <p className="mt-3 truncate text-xs font-medium text-muted sm:text-sm">
                      {record ? formatHours(record.hours) : "0時間"}
                    </p>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <div className="space-y-5">
        <section className="rounded-md border border-line bg-panel p-5 shadow-subtle">
          <p className="text-sm font-medium text-muted">選択中の日</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">{formatLongJapaneseDate(selectedDate)}</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-md border border-line bg-panelSoft p-4">
              <p className="text-sm text-muted">勉強時間</p>
              <p className="mt-2 text-2xl font-semibold text-accent">
                {formatHours(selectedRecord?.hours ?? 0)}
              </p>
            </div>
            <div className="rounded-md border border-line bg-panelSoft p-4">
              <p className="text-sm text-muted">タスク</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{selectedTasks.length}件</p>
            </div>
          </div>
        </section>

        <TaskList data={data} date={selectedDate} title="この日のタスク" />
      </div>
    </div>
  );
}
