"use client";

import { Check, Sparkles } from "lucide-react";
import { useEffect, useMemo } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import type { StudyData } from "@/types/study";
import { formatJapaneseDate } from "@/utils/date";

type AutoTaskListProps = {
  data: StudyData;
  date: string;
  title?: string;
  shouldGenerate?: boolean;
  readOnly?: boolean;
  emptyDescription?: string;
  completionMessage?: string;
};

export function AutoTaskList({
  data,
  date,
  title = "今日の自動タスク",
  shouldGenerate = true,
  readOnly = false,
  emptyDescription = "設定画面で毎日タスク設定を追加すると、当日の範囲が自動で表示されます。",
  completionMessage = "今日の必修タスク完了"
}: AutoTaskListProps) {
  useEffect(() => {
    if (data.isReady && shouldGenerate) {
      data.ensureDailyTasksForDate(date);
    }
  }, [data, date, shouldGenerate]);

  const tasks = useMemo(() => {
    return data.dailyGeneratedTasks[date] ?? [];
  }, [data.dailyGeneratedTasks, date]);

  const completedCount = tasks.filter((task) => task.completed).length;
  const allCompleted = tasks.length > 0 && completedCount === tasks.length;

  return (
    <section className="rounded-md border border-line bg-panel p-5 shadow-subtle">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">{formatJapaneseDate(date)}</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">{title}</h2>
        </div>
        <p className="text-sm text-muted">
          {completedCount} / {tasks.length} 完了
        </p>
      </div>

      {allCompleted && (
        <div className="mt-5 flex items-center gap-3 rounded-md border border-good/40 bg-good/10 px-4 py-3 text-good">
          <Sparkles size={18} aria-hidden />
          <p className="text-sm font-semibold">{completionMessage}</p>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {tasks.length === 0 ? (
          <EmptyState title="自動タスクはありません" description={emptyDescription} />
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-md border border-line bg-panelSoft p-4"
            >
              <button
                type="button"
                onClick={() => {
                  if (!readOnly) {
                    data.toggleDailyGeneratedTask(date, task.id, !task.completed);
                  }
                }}
                disabled={readOnly}
                className={`grid h-7 w-7 place-items-center rounded-md border ${
                  task.completed ? "border-good bg-good text-surface" : "border-line text-transparent"
                } ${readOnly ? "cursor-default" : ""}`}
                aria-label={readOnly ? (task.completed ? "履歴: 完了" : "履歴: 未完了") : task.completed ? "完了を外す" : "完了にする"}
                title={readOnly ? "履歴表示" : task.completed ? "完了を外す" : "完了"}
              >
                <Check size={17} aria-hidden />
              </button>

              <div className="min-w-0">
                <p className={`truncate font-medium ${task.completed ? "text-muted line-through" : "text-ink"}`}>
                  {task.title}
                </p>
                <p className="mt-1 text-sm text-muted">{task.subject}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
