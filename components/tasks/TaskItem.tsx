"use client";

import { Check, Pencil, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { SubjectSelect } from "@/components/shared/SubjectSelect";
import type { StudyData, StudyTask, Subject } from "@/types/study";

type TaskItemProps = {
  task: StudyTask;
  data: StudyData;
};

export function TaskItem({ task, data }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [subject, setSubject] = useState<Subject>(task.subject);

  const save = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    data.updateTask(task.id, { title: trimmedTitle, subject });
    setIsEditing(false);
  };

  const cancel = () => {
    setTitle(task.title);
    setSubject(task.subject);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="rounded-md border border-line bg-panelSoft p-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem]">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted">タスク名</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-12 w-full rounded-md border border-line bg-surface px-3 text-base text-ink outline-none focus:border-accent"
            />
          </label>
          <SubjectSelect value={subject} onChange={setSubject} />
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={cancel}
            className="grid h-10 w-10 place-items-center rounded-md border border-line text-muted hover:text-ink"
            aria-label="編集をキャンセル"
            title="キャンセル"
          >
            <X size={18} aria-hidden />
          </button>
          <button
            type="button"
            onClick={save}
            className="grid h-10 w-10 place-items-center rounded-md bg-accent text-surface"
            aria-label="保存"
            title="保存"
          >
            <Save size={18} aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-line bg-panelSoft p-4">
      <button
        type="button"
        onClick={() => data.updateTask(task.id, { completed: !task.completed })}
        className={`grid h-7 w-7 place-items-center rounded-md border ${
          task.completed ? "border-good bg-good text-surface" : "border-line text-transparent"
        }`}
        aria-label={task.completed ? "完了を外す" : "完了にする"}
        title={task.completed ? "完了を外す" : "完了"}
      >
        <Check size={17} aria-hidden />
      </button>

      <div className="min-w-0">
        <p className={`truncate font-medium ${task.completed ? "text-muted line-through" : "text-ink"}`}>
          {task.title}
        </p>
        <p className="mt-1 text-sm text-muted">{task.subject}</p>
      </div>

      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="grid h-10 w-10 place-items-center rounded-md text-muted hover:bg-panel hover:text-ink"
          aria-label="編集"
          title="編集"
        >
          <Pencil size={18} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => data.deleteTask(task.id)}
          className="grid h-10 w-10 place-items-center rounded-md text-muted hover:bg-panel hover:text-ink"
          aria-label="削除"
          title="削除"
        >
          <Trash2 size={18} aria-hidden />
        </button>
      </div>
    </div>
  );
}
