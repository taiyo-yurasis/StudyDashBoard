export type Subject =
  | "英語"
  | "数学"
  | "国語"
  | "物理"
  | "化学"
  | "生物"
  | "地学"
  | "日本史"
  | "世界史"
  | "地理"
  | "公民"
  | "情報"
  | "小論文"
  | "その他";

export type StudyTask = {
  id: string;
  title: string;
  subject: Subject;
  date: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StudyBook = {
  id: string;
  subject: Subject;
  title: string;
  totalPages: number;
  currentPage: number;
  createdAt: string;
  updatedAt: string;
};

export type StudyRecord = {
  date: string;
  hours: number;
  updatedAt: string;
};

export type StudySession = {
  id: string;
  date: string;
  subject: Subject;
  bookId?: string;
  bookTitle?: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  memo?: string;
  createdAt: string;
  updatedAt: string;
};

export type ActiveTimerStatus = "running" | "paused";

export type ActiveTimer = {
  subject: Subject;
  bookId?: string;
  planMaterialTitle?: string;
  memo: string;
  status: ActiveTimerStatus;
  startTime: string;
  activeStartedAt: string | null;
  accumulatedSeconds: number;
};

export type DailyUnitType = "page" | "problem" | "word" | "example" | "minute";

export type DailyPlan = {
  id: string;
  subject: Subject;
  materialName: string;
  unitType: DailyUnitType;
  totalAmount: number;
  currentAmount: number;
  dailyAmount: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DailyGeneratedTask = {
  id: string;
  planId: string;
  title: string;
  subject: Subject;
  startAmount: number;
  endAmount: number;
  unitType: DailyUnitType;
  completed: boolean;
};

export type AppSettings = {
  examDate: string;
};

export type StudyState = {
  tasks: StudyTask[];
  books: StudyBook[];
  records: StudyRecord[];
  studySessions: StudySession[];
  activeTimer: ActiveTimer | null;
  dailyPlans: DailyPlan[];
  dailyGeneratedTasks: Record<string, DailyGeneratedTask[]>;
  settings: AppSettings;
};

export type StudyDataActions = {
  addTask: (task: Omit<StudyTask, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, updates: Partial<Omit<StudyTask, "id" | "createdAt">>) => void;
  deleteTask: (id: string) => void;
  addBook: (book: Omit<StudyBook, "id" | "createdAt" | "updatedAt">) => void;
  updateBook: (id: string, updates: Partial<Omit<StudyBook, "id" | "createdAt">>) => void;
  deleteBook: (id: string) => void;
  setStudyHours: (date: string, hours: number) => void;
  addStudySession: (session: Omit<StudySession, "id" | "createdAt" | "updatedAt">) => void;
  deleteStudySession: (id: string) => void;
  startTimer: (input: { subject: Subject; bookId?: string; planMaterialTitle?: string; memo: string }) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  updateTimerDraft: (updates: Partial<Pick<ActiveTimer, "subject" | "bookId" | "planMaterialTitle" | "memo">>) => void;
  finishTimer: () => void;
  addDailyPlan: (plan: Omit<DailyPlan, "id" | "createdAt" | "updatedAt">) => void;
  updateDailyPlan: (id: string, updates: Partial<Omit<DailyPlan, "id" | "createdAt">>) => void;
  deleteDailyPlan: (id: string) => void;
  ensureDailyTasksForDate: (date: string) => void;
  toggleDailyGeneratedTask: (date: string, taskId: string, completed: boolean) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetAllData: () => void;
};

export type StudyData = StudyState & StudyDataActions & {
  isReady: boolean;
};
