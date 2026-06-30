"use client";

import { useEffect, useMemo, useState } from "react";
import { APP_CONFIG } from "@/lib/config";
import type {
  AppSettings,
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

function normalizeState(value: unknown): StudyState {
  const source = value as Partial<StudyState> | null;

  return {
    tasks: Array.isArray(source?.tasks) ? source.tasks : initialState.tasks,
    books: Array.isArray(source?.books) ? source.books : initialState.books,
    records: Array.isArray(source?.records) ? source.records : initialState.records,
    studySessions: Array.isArray(source?.studySessions) ? source.studySessions : initialState.studySessions,
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

    window.localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(state));
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
        const nextSession: StudySession = {
          ...session,
          id: createId("session"),
          durationSeconds: Math.max(0, Math.round(session.durationSeconds)),
          createdAt: timestamp,
          updatedAt: timestamp
        };
        const additionalHours = nextSession.durationSeconds / 3600;

        setState((current) => {
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
