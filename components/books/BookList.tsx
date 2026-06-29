"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { BookProgressCard } from "@/components/books/BookProgressCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { SubjectSelect } from "@/components/shared/SubjectSelect";
import type { StudyData, Subject } from "@/types/study";
import { clampNumber } from "@/utils/progress";

type BookListProps = {
  data: StudyData;
};

export function BookList({ data }: BookListProps) {
  const [subject, setSubject] = useState<Subject>("英語");
  const [title, setTitle] = useState("");
  const [totalPages, setTotalPages] = useState("");
  const [currentPage, setCurrentPage] = useState("");

  const addBook = () => {
    const trimmedTitle = title.trim();
    const total = Math.max(1, Math.round(Number(totalPages) || 0));
    const current = clampNumber(Math.round(Number(currentPage) || 0), 0, total);

    if (!trimmedTitle || total <= 0) {
      return;
    }

    data.addBook({
      subject,
      title: trimmedTitle,
      totalPages: total,
      currentPage: current
    });
    setTitle("");
    setTotalPages("");
    setCurrentPage("");
  };

  return (
    <div className="space-y-5">
      <section className="rounded-md border border-line bg-panel p-5 shadow-subtle">
        <div>
          <p className="text-sm font-medium text-muted">参考書管理</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">進捗を登録</h2>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[11rem_minmax(0,1fr)_9rem_9rem_auto]">
          <SubjectSelect value={subject} onChange={setSubject} />
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted">参考書名</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="例: システム英単語"
              className="h-12 w-full rounded-md border border-line bg-panelSoft px-3 text-base text-ink outline-none placeholder:text-muted/65 focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted">全体</span>
            <input
              type="number"
              min="1"
              value={totalPages}
              onChange={(event) => setTotalPages(event.target.value)}
              className="h-12 w-full rounded-md border border-line bg-panelSoft px-3 text-base text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted">現在</span>
            <input
              type="number"
              min="0"
              value={currentPage}
              onChange={(event) => setCurrentPage(event.target.value)}
              className="h-12 w-full rounded-md border border-line bg-panelSoft px-3 text-base text-ink outline-none focus:border-accent"
            />
          </label>
          <button
            type="button"
            onClick={addBook}
            className="mt-auto flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-4 font-semibold text-surface"
          >
            <Plus size={18} aria-hidden />
            <span>追加</span>
          </button>
        </div>
      </section>

      {data.books.length === 0 ? (
        <EmptyState title="参考書はまだ登録されていません" description="よく使う教材から登録すると進み具合を追いやすくなります。" />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.books.map((book) => (
            <BookProgressCard key={book.id} book={book} data={data} />
          ))}
        </section>
      )}
    </div>
  );
}
