"use client";

import { RotateCcw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import type { StudyData } from "@/types/study";
import { formatLongJapaneseDate } from "@/utils/date";

type SettingsPanelProps = {
  data: StudyData;
};

export function SettingsPanel({ data }: SettingsPanelProps) {
  const [examDate, setExamDate] = useState(data.settings.examDate);

  useEffect(() => {
    setExamDate(data.settings.examDate);
  }, [data.settings.examDate]);

  const save = () => {
    if (!examDate) {
      return;
    }

    data.updateSettings({ examDate });
  };

  const reset = () => {
    const ok = window.confirm("保存済みのタスク、勉強時間、参考書、設定をすべて削除します。よろしいですか？");
    if (ok) {
      data.resetAllData();
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <section className="rounded-md border border-line bg-panel p-5 shadow-subtle">
        <div>
          <p className="text-sm font-medium text-muted">カウントダウン</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">共通テスト日</h2>
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-medium text-muted">日付</span>
          <input
            type="date"
            value={examDate}
            onChange={(event) => setExamDate(event.target.value)}
            className="h-12 w-full rounded-md border border-line bg-panelSoft px-3 text-base text-ink outline-none focus:border-accent"
          />
        </label>

        <p className="mt-3 text-sm text-muted">{examDate ? formatLongJapaneseDate(examDate) : "日付を選択してください"}</p>

        <button
          type="button"
          onClick={save}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-5 font-semibold text-surface"
        >
          <Save size={18} aria-hidden />
          <span>保存</span>
        </button>
      </section>

      <section className="rounded-md border border-line bg-panel p-5 shadow-subtle">
        <div>
          <p className="text-sm font-medium text-muted">LocalStorage</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">保存データ</h2>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <div className="rounded-md border border-line bg-panelSoft p-4">
            <p className="text-sm text-muted">タスク</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{data.tasks.length}</p>
          </div>
          <div className="rounded-md border border-line bg-panelSoft p-4">
            <p className="text-sm text-muted">勉強時間</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{data.records.length}</p>
          </div>
          <div className="rounded-md border border-line bg-panelSoft p-4">
            <p className="text-sm text-muted">参考書</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{data.books.length}</p>
          </div>
          <div className="rounded-md border border-line bg-panelSoft p-4">
            <p className="text-sm text-muted">設定</p>
            <p className="mt-2 text-2xl font-semibold text-ink">1</p>
          </div>
        </div>

        <button
          type="button"
          onClick={reset}
          className="mt-5 flex h-12 items-center justify-center gap-2 rounded-md border border-line px-5 font-semibold text-muted hover:text-ink"
        >
          <RotateCcw size={18} aria-hidden />
          <span>すべてリセット</span>
        </button>
      </section>
    </div>
  );
}
