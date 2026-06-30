"use client";

import type { Subject } from "@/types/study";

export const subjects: Subject[] = [
  "英語",
  "数学",
  "国語",
  "物理",
  "化学",
  "生物",
  "地学",
  "日本史",
  "世界史",
  "地理",
  "公民",
  "情報",
  "小論文",
  "その他"
];

type SubjectSelectProps = {
  value: Subject;
  onChange: (subject: Subject) => void;
  label?: string;
  disabled?: boolean;
};

export function SubjectSelect({ value, onChange, label = "教科", disabled = false }: SubjectSelectProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-muted">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as Subject)}
        disabled={disabled}
        className="h-12 w-full rounded-md border border-line bg-panelSoft px-3 text-base text-ink outline-none focus:border-accent"
      >
        {subjects.map((subject) => (
          <option key={subject} value={subject}>
            {subject}
          </option>
        ))}
      </select>
    </label>
  );
}
