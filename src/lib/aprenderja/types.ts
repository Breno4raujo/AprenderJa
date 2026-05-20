export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  totalModules: number;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  order: number;
  totalLessons: number;
}

export interface UserProgress {
  id: string;
  userId: string;
  moduleId: string;
  completedLessons: number;
  lastAccessedAt: Date | null;
  completedAt: Date | null;
}

export type PaceMode = "leve" | "focado" | "intenso";

export interface ModuleProgressView {
  module: Module;
  completedLessons: number;
  percent: number;
  isCompleted: boolean;
  lastAccessedAt: Date | null;
}

export interface SoftSkillBadge {
  id: string;
  label: string;
  description: string;
  earned: boolean;
  icon: "weekend" | "early" | "comeback" | "consistency";
}

export interface ProgressSummary {
  course: Course;
  overallPercent: number;
  totalLessons: number;
  completedLessons: number;
  modules: ModuleProgressView[];
  estimatedWeeksRemaining: number;
  pace: PaceMode;
  paceHoursPerWeek: number;
  encouragement: string;
  resumeContext: {
    moduleTitle: string;
    lessonNumber: number;
    daysSince: number;
  } | null;
  weeklyEnergy: { current: number; goal: number };
  badges: SoftSkillBadge[];
}

export interface Victory {
  id: string;
  kind: "module" | "milestone" | "badge";
  title: string;
  message: string;
  earnedAt: Date;
}