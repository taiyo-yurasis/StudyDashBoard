"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { SubjectSelect } from "@/components/shared/SubjectSelect";
import { TaskItem } from "@/components/tasks/TaskItem";
import type { StudyData, Subject } from "@/types/study";
import { formatJapaneseDate } from "@/utils/date";

type TaskListProps = {
  data: StudyData;
  date: string;
  title: string;
};

export function TaskList({ data, date, title }: TaskListProps) {
  const [taskTitle, setTaskTitle] = useState("");
  const [subject, setSubject] = useState<Subject>("英語");

  const tasks = useMemo(() => {
    return data.tasks
      .filter((task) => task.date === date)
      .sort((a, b) => Number(a.completed) - Number(b.completed) || b.createdAt.localeCompare(a.createdAt));
  }, [data.tasks, date]);

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
        <p className="text-sm text-muted">
          {tasks.filter((task) => task.completed).length} / {tasks.length} 完了
        </p>
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

      <div className="mt-5 space-y-3">
        {tasks.length === 0 ? (
          <EmptyState title="今日のタスクはまだありません" description="最初に取り組む内容をひとつ追加しましょう。" />
        ) : (
          tasks.map((task) => <TaskItem key={task.id} task={task} data={data} />)
        )}
      </div>
    </section>
  );
}
