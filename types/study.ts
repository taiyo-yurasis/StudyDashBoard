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

export type AppSettings = {
  examDate: string;
};

export type StudyState = {
  tasks: StudyTask[];
  books: StudyBook[];
  records: StudyRecord[];
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
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetAllData: () => void;
};

export type StudyData = StudyState & StudyDataActions & {
  isReady: boolean;
};
