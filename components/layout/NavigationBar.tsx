"use client";

import type { LucideIcon } from "lucide-react";

type NavigationTab<T extends string> = {
  key: T;
  label: string;
  icon: LucideIcon;
};

type NavigationBarProps<T extends string> = {
  tabs: NavigationTab<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
};

export function NavigationBar<T extends string>({ tabs, activeTab, onChange }: NavigationBarProps<T>) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/92 px-3 py-3 backdrop-blur app-safe-bottom">
      <div className="mx-auto grid max-w-2xl grid-cols-5 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-2 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-panelSoft text-ink"
                  : "text-muted hover:bg-panel hover:text-ink"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={20} aria-hidden />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
