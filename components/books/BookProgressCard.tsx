"use client";

import { Pencil, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { SubjectSelect } from "@/components/shared/SubjectSelect";
import type { StudyBook, StudyData, Subject } from "@/types/study";
import { calculateProgress, clampNumber } from "@/utils/progress";

type BookProgressCardProps = {
  book: StudyBook;
  data: StudyData;
};

export function BookProgressCard({ book, data }: BookProgressCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [subject, setSubject] = useState<Subject>(book.subject);
  const [title, setTitle] = useState(book.title);
  const [totalPages, setTotalPages] = useState(String(book.totalPages));
  const [currentPage, setCurrentPage] = useState(String(book.currentPage));
  const progress = calculateProgress(book.currentPage, book.totalPages);

  const save = () => {
    const nextTotal = Math.max(1, Math.round(Number(totalPages) || 1));
    const nextCurrent = clampNumber(Math.round(Number(currentPage) || 0), 0, nextTotal);
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    data.updateBook(book.id, {
      subject,
      title: trimmedTitle,
      totalPages: nextTotal,
      currentPage: nextCurrent
    });
    setIsEditing(false);
  };

  const cancel = () => {
    setSubject(book.subject);
    setTitle(book.title);
    setTotalPages(String(book.totalPages));
    setCurrentPage(String(book.currentPage));
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <article className="rounded-md border border-line bg-panel p-5 shadow-subtle">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem]">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted">参考書名</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-12 w-full rounded-md border border-line bg-panelSoft px-3 text-base text-ink outline-none focus:border-accent"
            />
          </label>
          <SubjectSelect value={subject} onChange={setSubject} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted">全体ページ数</span>
            <input
              type="number"
              min="1"
              value={totalPages}
              onChange={(event) => setTotalPages(event.target.value)}
              className="h-12 w-full rounded-md border border-line bg-panelSoft px-3 text-base text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted">現在ページ</span>
            <input
              type="number"
              min="0"
              value={currentPage}
              onChange={(event) => setCurrentPage(event.target.value)}
              className="h-12 w-full rounded-md border border-line bg-panelSoft px-3 text-base text-ink outline-none focus:border-accent"
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
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
      </article>
    );
  }

  return (
    <article className="rounded-md border border-line bg-panel p-5 shadow-subtle">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">{book.subject}</p>
          <h3 className="mt-1 truncate text-xl font-semibold text-ink">{book.title}</h3>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="grid h-10 w-10 place-items-center rounded-md text-muted hover:bg-panelSoft hover:text-ink"
            aria-label="編集"
            title="編集"
          >
            <Pencil size={18} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => data.deleteBook(book.id)}
            className="grid h-10 w-10 place-items-center rounded-md text-muted hover:bg-panelSoft hover:text-ink"
            aria-label="削除"
            title="削除"
          >
            <Trash2 size={18} aria-hidden />
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <p className="text-2xl font-semibold text-ink">
          {book.currentPage} / {book.totalPages}
        </p>
        <p className="text-2xl font-semibold text-accent">{progress}%</p>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-panelSoft">
        <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
      </div>
    </article>
  );
}
