"use client";

import { Settings } from "lucide-react";

type HeaderProps = {
  title: string;
  onOpenSettings: () => void;
};

export function Header({ title, onOpenSettings }: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-muted">Study Dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-normal text-ink sm:text-3xl">{title}</h1>
      </div>
      <button
        type="button"
        onClick={onOpenSettings}
        className="grid h-11 w-11 place-items-center rounded-full border border-line bg-panel text-muted shadow-subtle transition-colors hover:text-ink"
        aria-label="設定を開く"
        title="設定"
      >
        <Settings size={20} aria-hidden />
      </button>
    </header>
  );
}
