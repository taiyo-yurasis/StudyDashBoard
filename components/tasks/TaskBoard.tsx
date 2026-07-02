"use client";

import { Check, Plus, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { SubjectSelect } from "@/components/shared/SubjectSelect";
import { TaskItem } from "@/components/tasks/TaskItem";
import type { DailyGeneratedTask, StudyData, Subject } from "@/types/study";
import { formatJapaneseDate } from "@/utils/date";

type TaskBoardProps = {
  data: StudyData;
  date: string;
  title?: string;
  shouldGenerateAuto?: boolean;
  readOnlyAuto?: boolean;
  completionMessage?: string;
  autoEmptyDescription?: string;
};

type AutoTaskItemProps = {
  task: DailyGeneratedTask;
  date: string;
  data: StudyData;
  readOnly: boolean;
};

function AutoTaskItem({ task, date, data, readOnly }: AutoTaskItemProps) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-line bg-panelSoft p-4">
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

      <span className="rounded-md bg-accent/15 px-2 py-1 text-xs font-semibold text-accent">自動</span>
    </div>
  );
}

export function TaskBoard({
  data,
  date,
  title = "今日のタスク",
  shouldGenerateAuto = true,
  readOnlyAuto = false,
  completionMessage = "今日の必修タスク完了",
  autoEmptyDescription = "設定画面で毎日タスク設定を追加すると、当日の範囲が自動で表示されます。"
}: TaskBoardProps) {
  const [taskTitle, setTaskTitle] = useState("");
  const [subject, setSubject] = useState<Subject>("英語");

  useEffect(() => {
    if (data.isReady && shouldGenerateAuto) {
      data.ensureDailyTasksForDate(date);
    }
  }, [data, date, shouldGenerateAuto]);

  const autoTasks = useMemo(() => {
    return data.dailyGeneratedTasks[date] ?? [];
  }, [data.dailyGeneratedTasks, date]);

  const manualTasks = useMemo(() => {
    return data.tasks
      .filter((task) => task.date === date)
      .sort((a, b) => Number(a.completed) - Number(b.completed) || b.createdAt.localeCompare(a.createdAt));
  }, [data.tasks, date]);

  const autoCompletedCount = autoTasks.filter((task) => task.completed).length;
  const manualCompletedCount = manualTasks.filter((task) => task.completed).length;
  const totalCount = autoTasks.length + manualTasks.length;
  const completedCount = autoCompletedCount + manualCompletedCount;
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  const addTask = () => {
    const trimmedTitle = taskTitle.trim();
    if (!trimmedTitle) {
      return;
    }

    data.addTask({
      title: trimmedTitle,
      subject,
      date,
      completed: false
    });
    setTaskTitle("");
  };

  return (
    <section className="rounded-md border border-line bg-panel p-5 shadow-subtle">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">{formatJapaneseDate(date)}</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">{title}</h2>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-ink">
            {completedCount} / {totalCount}
          </p>
          <p className="mt-1 text-xs text-muted">
            自動 {autoCompletedCount}/{autoTasks.length}・手動 {manualCompletedCount}/{manualTasks.length}
          </p>
        </div>
      </div>

      {allCompleted && (
        <div className="mt-5 flex items-center gap-3 rounded-md border border-good/40 bg-good/10 px-4 py-3 text-good">
          <Sparkles size={18} aria-hidden />
          <p className="text-sm font-semibold">{completionMessage}</p>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {totalCount === 0 ? (
          <EmptyState
            title="まだタスクがありません"
            description={autoEmptyDescription || "最初に取り組む内容をひとつ追加しましょう。"}
          />
        ) : (
          <>
            {autoTasks.map((task) => (
              <AutoTaskItem key={task.id} task={task} date={date} data={data} readOnly={readOnlyAuto} />
            ))}
            {manualTasks.map((task) => (
              <TaskItem key={task.id} task={task} data={data} />
            ))}
          </>
        )}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem_auto]">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted">タスク名</span>
          <input
            value={taskTitle}
            onChange={(event) => setTaskTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                addTask();
              }
            }}
            placeholder="例: 数学IA 2024年追試"
            className="h-12 w-full rounded-md border border-line bg-panelSoft px-3 text-base text-ink outline-none placeholder:text-muted/65 focus:border-accent"
          />
        </label>
        <SubjectSelect value={subject} onChange={setSubject} />
        <button
          type="button"
          onClick={addTask}
          className="mt-auto flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-4 font-semibold text-surface"
        >
          <Plus size={18} aria-hidden />
          <span>追加</span>
        </button>
      </div>
    </section>
  );
}
