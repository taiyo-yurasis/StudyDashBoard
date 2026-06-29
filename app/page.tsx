"use client";

import { useMemo, useState } from "react";
import { BookOpen, CalendarDays, Home, Settings, Timer } from "lucide-react";
import { BookList } from "@/components/books/BookList";
import { CalendarView } from "@/components/calendar/CalendarView";
import { Header } from "@/components/layout/Header";
import { NavigationBar } from "@/components/layout/NavigationBar";
import { HomeDashboard } from "@/components/home/HomeDashboard";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { StudyHistory } from "@/components/study/StudyHistory";
import { StudyTimer } from "@/components/study/StudyTimer";
import { useStudyData } from "@/hooks/useStudyData";

type TabKey = "home" | "books" | "study" | "calendar" | "settings";

const tabs = [
  { key: "home" as const, label: "ホーム", icon: Home },
  { key: "books" as const, label: "参考書", icon: BookOpen },
  { key: "study" as const, label: "記録", icon: Timer },
  { key: "calendar" as const, label: "カレンダー", icon: CalendarDays },
  { key: "settings" as const, label: "設定", icon: Settings }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const studyData = useStudyData();

  const pageTitle = useMemo(() => {
    return tabs.find((tab) => tab.key === activeTab)?.label ?? "ホーム";
  }, [activeTab]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-28 pt-5 text-ink sm:px-6 lg:px-8">
      <Header title={pageTitle} onOpenSettings={() => setActiveTab("settings")} />

      <div className="mt-5 flex-1">
        {activeTab === "home" && <HomeDashboard data={studyData} />}
        {activeTab === "books" && <BookList data={studyData} />}
        {activeTab === "study" && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <StudyTimer data={studyData} />
            <StudyHistory data={studyData} />
          </div>
        )}
        {activeTab === "calendar" && <CalendarView data={studyData} />}
        {activeTab === "settings" && <SettingsPanel data={studyData} />}
      </div>

      <NavigationBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
    </main>
  );
}
