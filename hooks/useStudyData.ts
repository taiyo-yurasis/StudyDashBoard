"use client";

import { useEffect, useMemo, useState } from "react";
import { APP_CONFIG } from "@/lib/config";
import { todayKey, toDateKey } from "@/utils/date";
import type {
  ActiveTimer,
  AppSettings,
  DailyGeneratedTask,
  DailyPlan,
  StudyBook,
  StudyData,
  StudyRecord,
  StudySession,
  StudyState,
  StudyTask
} from "@/types/study";

const initialState: StudyState = {
  tasks: [],
  books: [],
  records: [],
  studySessions: [],
  activeTimer: null,
  dailyPlans: [],
  dailyGeneratedTasks: {},
  settings: {
    examDate: APP_CONFIG.defaultExamDate
  }
};

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clampAmount(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizePlanAmounts(plan: DailyPlan): DailyPlan {
  const totalAmount = Math.max(1, Math.round(plan.totalAmount || 0));
  const currentAmount = clampAmount(Math.round(plan.currentAmount || 0), 0, totalAmount);
  const dailyAmount = Math.max(1, Math.round(plan.dailyAmount || 0));

  return {
    ...plan,
    totalAmount,
    currentAmount,
    dailyAmount
  };
}

function formatDailyTaskTitle(plan: DailyPlan, startAmount: number, endAmount: number): string {
  switch (plan.unitType) {
    case "page":
      return `${plan.materialName} p.${startAmount}〜${endAmount}`;
    case "problem":
      return `${plan.materialName} 問題${startAmount}〜${endAmount}`;
    case "word":
      return `${plan.materialName} No.${startAmount}〜${endAmount}`;
    case "example":
      return `${plan.materialName} 例題${startAmount}〜${endAmount}`;
    case "minute":
      return `${plan.materialName} ${startAmount}〜${endAmount}分`;
    default:
      return `${plan.materialName} ${startAmount}〜${endAmount}`;
  }
}

function buildDailyGeneratedTask(plan: DailyPlan): DailyGeneratedTask {
  const startAmount = plan.currentAmount + 1;
  const endAmount = Math.min(plan.currentAmount + plan.dailyAmount, plan.totalAmount);

  return {
    id: createId("auto-task"),
    planId: plan.id,
    title: formatDailyTaskTitle(plan, startAmount, endAmount),
    subject: plan.subject,
    startAmount,
    endAmount,
    unitType: plan.unitType,
    completed: false
  };
}

function isValidIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function normalizeActiveTimer(value: unknown): ActiveTimer | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const timer = value as Partial<ActiveTimer>;
  const activeStartedAt =
    timer.activeStartedAt === null || isValidIsoDate(timer.activeStartedAt)
      ? timer.activeStartedAt
      : null;

  if (
    typeof timer.subject !== "string" ||
    typeof timer.memo !== "string" ||
    (timer.status !== "running" && timer.status !== "paused") ||
    !isValidIsoDate(timer.startTime) ||
    typeof timer.accumulatedSeconds !== "number" ||
    !Number.isFinite(timer.accumulatedSeconds)
  ) {
    return null;
  }

  if (timer.status === "running" && !activeStartedAt) {
    return null;
  }

  return {
    subject: timer.subject,
    bookId: typeof timer.bookId === "string" && timer.bookId ? timer.bookId : undefined,
    memo: timer.memo,
    status: timer.status,
    startTime: timer.startTime,
    activeStartedAt: timer.status === "running" ? activeStartedAt : null,
    accumulatedSeconds: Math.max(0, Math.round(timer.accumulatedSeconds))
  };
}

function calculateTimerSeconds(timer: ActiveTimer, endMs = Date.now()): number {
  if (timer.status !== "running" || !timer.activeStartedAt) {
    return timer.accumulatedSeconds;
  }

  return Math.max(
    0,
    timer.accumulatedSeconds + Math.floor((endMs - new Date(timer.activeStartedAt).getTime()) / 1000)
  );
}

function addSessionToState(
  current: StudyState,
  session: Omit<StudySession, "id" | "createdAt" | "updatedAt">,
  timestamp: string
): StudyState {
  const nextSession: StudySession = {
    ...session,
    id: createId("session"),
    durationSeconds: Math.max(0, Math.round(session.durationSeconds)),
    createdAt: timestamp,
    updatedAt: timestamp
  };
  const additionalHours = nextSession.durationSeconds / 3600;
  const existingRecord = current.records.find((record) => record.date === nextSession.date);
  const nextRecord: StudyRecord = {
    date: nextSession.date,
    hours: Number(((existingRecord?.hours ?? 0) + additionalHours).toFixed(3)),
    updatedAt: timestamp
  };

  return {
    ...current,
    studySessions: [nextSession, ...current.studySessions],
    records: existingRecord
      ? current.records.map((record) => (record.date === nextSession.date ? nextRecord : record))
      : [nextRecord, ...current.records]
  };
}

function normalizeState(value: unknown): StudyState {
  const source = value as Partial<StudyState> | null;
  const dailyGeneratedTasks =
    source?.dailyGeneratedTasks &&
    typeof source.dailyGeneratedTasks === "object" &&
    !Array.isArray(source.dailyGeneratedTasks)
      ? source.dailyGeneratedTasks
      : initialState.dailyGeneratedTasks;

  return {
    tasks: Array.isArray(source?.tasks) ? source.tasks : initialState.tasks,
    books: Array.isArray(source?.books) ? source.books : initialState.books,
    records: Array.isArray(source?.records) ? source.records : initialState.records,
    studySessions: Array.isArray(source?.studySessions) ? source.studySessions : initialState.studySessions,
    activeTimer: normalizeActiveTimer(source?.activeTimer),
    dailyPlans: Array.isArray(source?.dailyPlans)
      ? source.dailyPlans.map((plan) => normalizePlanAmounts(plan))
      : initialState.dailyPlans,
    dailyGeneratedTasks,
    settings: {
      ...initialState.settings,
      ...(source?.settings ?? {})
    }
  };
}

export function useStudyData(): StudyData {
  const [state, setState] = useState<StudyState>(initialState);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(APP_CONFIG.storageKey);
      if (stored) {
        setState(normalizeState(JSON.parse(stored)));
      }
    } catch {
      setState(initialState);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const flush = () => {
      window.localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(state));
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flush();
      }
    };
    const timeoutId = window.setTimeout(flush, 500);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", flush);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", flush);
    };
  }, [isReady, state]);

  return useMemo<StudyData>(() => {
    const now = () => new Date().toISOString();

    return {
      ...state,
      isReady,
      addTask: (task) => {
        const timestamp = now();
        const nextTask: StudyTask = {
          ...task,
          id: createId("task"),
          createdAt: timestamp,
          updatedAt: timestamp
        };
        setState((current) => ({ ...current, tasks: [nextTask, ...current.tasks] }));
      },
      updateTask: (id, updates) => {
        setState((current) => ({
          ...current,
          tasks: current.tasks.map((task) =>
            task.id === id ? { ...task, ...updates, updatedAt: now() } : task
          )
        }));
      },
      deleteTask: (id) => {
        setState((current) => ({
          ...current,
          tasks: current.tasks.filter((task) => task.id !== id)
        }));
      },
      addBook: (book) => {
        const timestamp = now();
        const nextBook: StudyBook = {
          ...book,
          id: createId("book"),
          createdAt: timestamp,
          updatedAt: timestamp
        };
        setState((current) => ({ ...current, books: [nextBook, ...current.books] }));
      },
      updateBook: (id, updates) => {
        setState((current) => ({
          ...current,
          books: current.books.map((book) =>
            book.id === id ? { ...book, ...updates, updatedAt: now() } : book
          )
        }));
      },
      deleteBook: (id) => {
        setState((current) => ({
          ...current,
          books: current.books.filter((book) => book.id !== id)
        }));
      },
      setStudyHours: (date, hours) => {
        const nextRecord: StudyRecord = {
          date,
          hours: Math.max(0, Number(hours.toFixed(1))),
          updatedAt: now()
        };

        setState((current) => {
          const exists = current.records.some((record) => record.date === date);
          return {
            ...current,
            records: exists
              ? current.records.map((record) => (record.date === date ? nextRecord : record))
              : [nextRecord, ...current.records]
          };
        });
      },
      addStudySession: (session) => {
        const timestamp = now();
        setState((current) => addSessionToState(current, session, timestamp));
      },
      deleteStudySession: (id) => {
        setState((current) => {
          const target = current.studySessions.find((session) => session.id === id);
          if (!target) {
            return current;
          }

          const timestamp = now();
          const nextSessions = current.studySessions.filter((session) => session.id !== id);
          const remainingSecondsForDate = nextSessions
            .filter((session) => session.date === target.date)
            .reduce((sum, session) => sum + session.durationSeconds, 0);
          const nextRecords =
            remainingSecondsForDate > 0
              ? current.records.map((record) =>
                  record.date === target.date
                    ? {
                        ...record,
                        hours: Number((remainingSecondsForDate / 3600).toFixed(3)),
                        updatedAt: timestamp
                      }
                    : record
                )
              : current.records.filter((record) => record.date !== target.date);

          return {
            ...current,
            studySessions: nextSessions,
            records: nextRecords
          };
        });
      },
      startTimer: (input) => {
        const timestamp = now();
        setState((current) => ({
          ...current,
          activeTimer: {
            subject: input.subject,
            bookId: input.bookId || undefined,
            memo: input.memo,
            status: "running",
            startTime: timestamp,
            activeStartedAt: timestamp,
            accumulatedSeconds: 0
          }
        }));
      },
      pauseTimer: () => {
        setState((current) => {
          if (!current.activeTimer || current.activeTimer.status !== "running") {
            return current;
          }

          return {
            ...current,
            activeTimer: {
              ...current.activeTimer,
              status: "paused",
              activeStartedAt: null,
              accumulatedSeconds: calculateTimerSeconds(current.activeTimer)
            }
          };
        });
      },
      resumeTimer: () => {
        setState((current) => {
          if (!current.activeTimer || current.activeTimer.status !== "paused") {
            return current;
          }

          return {
            ...current,
            activeTimer: {
              ...current.activeTimer,
              status: "running",
              activeStartedAt: now()
            }
          };
        });
      },
      updateTimerDraft: (updates) => {
        setState((current) => {
          if (!current.activeTimer) {
            return current;
          }

          const hasBookIdUpdate = Object.prototype.hasOwnProperty.call(updates, "bookId");

          return {
            ...current,
            activeTimer: {
              ...current.activeTimer,
              ...updates,
              bookId: hasBookIdUpdate ? updates.bookId || undefined : current.activeTimer.bookId
            }
          };
        });
      },
      finishTimer: () => {
        setState((current) => {
          if (!current.activeTimer) {
            return current;
          }

          const timestamp = now();
          const selectedBook = current.books.find((book) => book.id === current.activeTimer?.bookId);
          const trimmedMemo = current.activeTimer.memo.trim();
          const nextState = addSessionToState(
            current,
            {
              date: toDateKey(new Date(current.activeTimer.startTime)),
              subject: current.activeTimer.subject,
              bookId: selectedBook?.id,
              bookTitle: selectedBook?.title,
              startTime: current.activeTimer.startTime,
              endTime: timestamp,
              durationSeconds: calculateTimerSeconds(current.activeTimer, new Date(timestamp).getTime()),
              memo: trimmedMemo || undefined
            },
            timestamp
          );

          return {
            ...nextState,
            activeTimer: null
          };
        });
      },
      addDailyPlan: (plan) => {
        const timestamp = now();
        const nextPlan: DailyPlan = normalizePlanAmounts({
          ...plan,
          id: createId("daily-plan"),
          createdAt: timestamp,
          updatedAt: timestamp
        });

        setState((current) => ({ ...current, dailyPlans: [nextPlan, ...current.dailyPlans] }));
      },
      updateDailyPlan: (id, updates) => {
        setState((current) => {
          const timestamp = now();
          const dailyPlans = current.dailyPlans.map((plan) =>
            plan.id === id
              ? normalizePlanAmounts({
                  ...plan,
                  ...updates,
                  updatedAt: timestamp
                })
              : plan
          );
          const updatedPlan = dailyPlans.find((plan) => plan.id === id);
          const today = todayKey();
          const todayTasks = current.dailyGeneratedTasks[today];

          if (!updatedPlan || !todayTasks) {
            return {
              ...current,
              dailyPlans
            };
          }

          const existingTask = todayTasks.find((task) => task.planId === id);
          const shouldShowTask = updatedPlan.enabled && updatedPlan.currentAmount < updatedPlan.totalAmount;
          const nextTodayTasks = todayTasks.filter((task) => task.planId !== id);

          if (shouldShowTask) {
            const nextTask = buildDailyGeneratedTask(updatedPlan);
            const canKeepCompleted =
              Boolean(existingTask?.completed) &&
              existingTask?.startAmount === nextTask.startAmount &&
              existingTask?.endAmount === nextTask.endAmount &&
              existingTask?.unitType === nextTask.unitType;

            nextTodayTasks.push({
              ...nextTask,
              id: existingTask?.id ?? nextTask.id,
              completed: canKeepCompleted
            });
          }

          return {
            ...current,
            dailyPlans,
            dailyGeneratedTasks: {
              ...current.dailyGeneratedTasks,
              [today]: nextTodayTasks
            }
          };
        });
      },
      deleteDailyPlan: (id) => {
        setState((current) => ({
          ...current,
          dailyPlans: current.dailyPlans.filter((plan) => plan.id !== id),
          dailyGeneratedTasks: Object.fromEntries(
            Object.entries(current.dailyGeneratedTasks).map(([date, tasks]) => [
              date,
              tasks.filter((task) => task.planId !== id)
            ])
          )
        }));
      },
      ensureDailyTasksForDate: (date) => {
        setState((current) => {
          const existingTasks = current.dailyGeneratedTasks[date];
          const eligiblePlans = current.dailyPlans.filter(
            (plan) => plan.enabled && plan.currentAmount < plan.totalAmount
          );

          if (existingTasks && (existingTasks.length > 0 || eligiblePlans.length === 0)) {
            return current;
          }

          const tasks = eligiblePlans.map((plan) => buildDailyGeneratedTask(plan));

          return {
            ...current,
            dailyGeneratedTasks: {
              ...current.dailyGeneratedTasks,
              [date]: tasks
            }
          };
        });
      },
      toggleDailyGeneratedTask: (date, taskId, completed) => {
        setState((current) => {
          const tasks = current.dailyGeneratedTasks[date] ?? [];
          const targetTask = tasks.find((task) => task.id === taskId);

          if (!targetTask) {
            return current;
          }

          const nextTasks = tasks.map((task) => (task.id === taskId ? { ...task, completed } : task));
          const nextPlans = current.dailyPlans.map((plan) => {
            if (plan.id !== targetTask.planId) {
              return plan;
            }

            const nextCurrent = completed ? targetTask.endAmount : targetTask.startAmount - 1;
            return normalizePlanAmounts({
              ...plan,
              currentAmount: nextCurrent,
              updatedAt: now()
            });
          });

          return {
            ...current,
            dailyPlans: nextPlans,
            dailyGeneratedTasks: {
              ...current.dailyGeneratedTasks,
              [date]: nextTasks
            }
          };
        });
      },
      updateSettings: (settings: Partial<AppSettings>) => {
        setState((current) => ({
          ...current,
          settings: {
            ...current.settings,
            ...settings
          }
        }));
      },
      resetAllData: () => {
        setState(initialState);
      }
    };
  }, [isReady, state]);
}
