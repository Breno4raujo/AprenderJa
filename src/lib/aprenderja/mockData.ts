import type { Course, Module, User, UserProgress } from "./types";

export const mockUser: User = {
  id: "u1",
  name: "Marina",
  email: "marina@example.com",
  createdAt: new Date("2025-03-01"),
};

export const mockCourse: Course = {
  id: "c1",
  title: "Fundamentos de Análise de Dados",
  description:
    "Uma jornada prática para você dominar planilhas, SQL e visualização — no seu ritmo.",
  totalModules: 6,
};

export const mockModules: Module[] = [
  { id: "m1", courseId: "c1", order: 1, title: "Boas-vindas e Mentalidade Digital", totalLessons: 6 },
  { id: "m2", courseId: "c1", order: 2, title: "Planilhas do Zero ao Avançado", totalLessons: 10 },
  { id: "m3", courseId: "c1", order: 3, title: "Pensamento Analítico na Prática", totalLessons: 8 },
  { id: "m4", courseId: "c1", order: 4, title: "SQL para Quem Nunca Programou", totalLessons: 12 },
  { id: "m5", courseId: "c1", order: 5, title: "Visualização e Storytelling com Dados", totalLessons: 9 },
  { id: "m6", courseId: "c1", order: 6, title: "Projeto Final e Portfólio", totalLessons: 5 },
];

const day = (d: number) => {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return date;
};

export const initialProgress: UserProgress[] = [
  { id: "p1", userId: "u1", moduleId: "m1", completedLessons: 6, lastAccessedAt: day(28), completedAt: day(21) },
  { id: "p2", userId: "u1", moduleId: "m2", completedLessons: 10, lastAccessedAt: day(20), completedAt: day(10) },
  { id: "p3", userId: "u1", moduleId: "m3", completedLessons: 5, lastAccessedAt: day(3), completedAt: null },
  { id: "p4", userId: "u1", moduleId: "m4", completedLessons: 0, lastAccessedAt: null, completedAt: null },
  { id: "p5", userId: "u1", moduleId: "m5", completedLessons: 0, lastAccessedAt: null, completedAt: null },
  { id: "p6", userId: "u1", moduleId: "m6", completedLessons: 0, lastAccessedAt: null, completedAt: null },
];