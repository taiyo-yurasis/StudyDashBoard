"use client";

import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { SubjectSelect } from "@/components/shared/SubjectSelect";
import type { DailyPlan, DailyUnitType, StudyData, Subject } from "@/types/study";

type DailyPlanSettingsProps = {
  data: StudyData;
};

type DailyPlanFormValues = {
  subject: Subject;
  materialName: string;
  unitType: DailyUnitType;
  totalAmount: string;
  currentAmount: string;
  dailyAmount: string;
  enabled: boolean;
};

const unitOptions: Array<{ value: DailyUnitType; label: string }> = [
  { value: "page", label: "ページ" },
  { value: "problem", label: "問題" },
  { value: "word", label: "語" },
  { value: "example", label: "例題" },
  { value: "minute", label: "分" }
];

const emptyForm: DailyPlanFormValues = {
  subject: "英語",
  materialName: "",
  unitType: "word",
  totalAmount: "",
  currentAmount: "0",
  dailyAmount: "",
  enabled: true
};

function toFormValues(plan: DailyPlan): DailyPlanFormValues {
  return {
    subject: plan.subject,
    materialName: plan.materialName,
    unitType: plan.unitType,
    totalAmount: String(plan.totalAmount),
    currentAmount: String(plan.currentAmount),
    dailyAmount: String(plan.dailyAmount),
    enabled: plan.enabled
  };
}

function parsePlanValues(values: DailyPlanFormValues) {
  const materialName = values.materialName.trim();
  const totalAmount = Math.round(Number(values.totalAmount) || 0);
  const currentAmount = Math.round(Number(values.currentAmount) || 0);
  const dailyAmount = Math.round(Number(values.dailyAmount) || 0);

  if (!materialName || totalAmount <= 0 || dailyAmount <= 0) {
    return null;
  }

  return {
    subject: values.subject,
    materialName,
    unitType: values.unitType,
    totalAmount,
    currentAmount,
    dailyAmount,
    enabled: values.enabled
  };
}

function UnitSelect({
  value,
  onChange
}: {
  value: DailyUnitType;
  onChange: (unitType: DailyUnitType) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-muted">単位</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as DailyUnitType)}
        className="h-12 w-full rounded-md border border-line bg-panelSoft px-3 text-base text-ink outline-none focus:border-accent"
      >
        {unitOptions.map((unit) => (
          <option key={unit.value} value={unit.value}>
            {unit.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberField({
  label,
  value,
  min,
  onChange
}: {
  label: string;
  value: string;
  min: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-muted">{label}</span>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-md border border-line bg-panelSoft px-3 text-base text-ink outline-none focus:border-accent"
      />
    </label>
  );
}

function EnabledToggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex h-12 items-center gap-3 rounded-md border border-line bg-panelSoft px-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-accent"
      />
      <span className="text-sm font-medium text-ink">{checked ? "有効" : "無効"}</span>
    </label>
  );
}

function DailyPlanRow({ plan, data }: { plan: DailyPlan; data: StudyData }) {
  const [values, setValues] = useState<DailyPlanFormValues>(() => toFormValues(plan));

  useEffect(() => {
    setValues(toFormValues(plan));
  }, [plan]);

  const update = <Key extends keyof DailyPlanFormValues>(key: Key, value: DailyPlanFormValues[Key]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const save = () => {
    const parsed = parsePlanValues(values);
    if (!parsed) {
      return;
    }

    data.updateDailyPlan(plan.id, parsed);
  };

  return (
    <div className="rounded-md border border-line bg-panelSoft p-4">
      <div className="grid gap-3 lg:grid-cols-[7.5rem_minmax(9rem,1fr)_6.5rem_repeat(3,5.5rem)_5.5rem_3rem_3rem] lg:items-end">
        <SubjectSelect value={values.subject} onChange={(subject) => update("subject", subject)} />
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted">参考書名</span>
          <input
            value={values.materialName}
            onChange={(event) => update("materialName", event.target.value)}
            className="h-12 w-full rounded-md border border-line bg-panel px-3 text-base text-ink outline-none focus:border-accent"
          />
        </label>
        <UnitSelect value={values.unitType} onChange={(unitType) => update("unitType", unitType)} />
        <NumberField label="総量" min="1" value={values.totalAmount} onChange={(value) => update("totalAmount", value)} />
        <NumberField label="現在" min="0" value={values.currentAmount} onChange={(value) => update("currentAmount", value)} />
        <NumberField label="1日" min="1" value={values.dailyAmount} onChange={(value) => update("dailyAmount", value)} />
        <div className="mt-auto">
          <EnabledToggle checked={values.enabled} onChange={(checked) => update("enabled", checked)} />
        </div>
        <button
          type="button"
          onClick={save}
          className="mt-auto grid h-12 w-12 place-items-center rounded-md bg-accent text-surface"
          aria-label="保存"
          title="保存"
        >
          <Save size={18} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => data.deleteDailyPlan(plan.id)}
          className="mt-auto grid h-12 w-12 place-items-center rounded-md border border-line text-muted hover:text-ink"
          aria-label="削除"
          title="削除"
        >
          <Trash2 size={18} aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function DailyPlanSettings({ data }: DailyPlanSettingsProps) {
  const [values, setValues] = useState<DailyPlanFormValues>(emptyForm);

  const update = <Key extends keyof DailyPlanFormValues>(key: Key, value: DailyPlanFormValues[Key]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const addPlan = () => {
    const parsed = parsePlanValues(values);
    if (!parsed) {
      return;
    }

    data.addDailyPlan(parsed);
    setValues(emptyForm);
  };

  return (
    <section className="rounded-md border border-line bg-panel p-5 shadow-subtle">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">毎日タスク設定</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">学習ペース</h2>
        </div>
        <p className="text-sm text-muted">{data.dailyPlans.filter((plan) => plan.enabled).length} 件有効</p>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[7.5rem_minmax(9rem,1fr)_6.5rem_repeat(3,5.5rem)_5.5rem_6rem] lg:items-end">
        <SubjectSelect value={values.subject} onChange={(subject) => update("subject", subject)} />
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted">参考書名</span>
          <input
            value={values.materialName}
            onChange={(event) => update("materialName", event.target.value)}
            placeholder="例: システム英単語"
            className="h-12 w-full rounded-md border border-line bg-panelSoft px-3 text-base text-ink outline-none placeholder:text-muted/65 focus:border-accent"
          />
        </label>
        <UnitSelect value={values.unitType} onChange={(unitType) => update("unitType", unitType)} />
        <NumberField label="総量" min="1" value={values.totalAmount} onChange={(value) => update("totalAmount", value)} />
        <NumberField label="現在" min="0" value={values.currentAmount} onChange={(value) => update("currentAmount", value)} />
        <NumberField label="1日" min="1" value={values.dailyAmount} onChange={(value) => update("dailyAmount", value)} />
        <div className="mt-auto">
          <EnabledToggle checked={values.enabled} onChange={(checked) => update("enabled", checked)} />
        </div>
        <button
          type="button"
          onClick={addPlan}
          className="mt-auto flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-4 font-semibold text-surface"
        >
          <Plus size={18} aria-hidden />
          <span>追加</span>
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {data.dailyPlans.length === 0 ? (
          <p className="rounded-md border border-line bg-panelSoft p-4 text-sm text-muted">
            毎日進めたい教材を登録すると、ホームに当日の範囲が自動表示されます。
          </p>
        ) : (
          data.dailyPlans.map((plan) => <DailyPlanRow key={plan.id} plan={plan} data={data} />)
        )}
      </div>
    </section>
  );
}
