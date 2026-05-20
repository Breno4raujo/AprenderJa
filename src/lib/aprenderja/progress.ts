import type {
  Course,
  Module,
  ModuleProgressView,
  PaceMode,
  ProgressSummary,
  SoftSkillBadge,
  UserProgress,
} from "./types";

export const PACE_HOURS: Record<PaceMode, number> = {
  leve: 2,
  focado: 5,
  intenso: 10,
};

const HOURS_PER_LESSON = 0.5; // estimativa acolhedora: ~30min por lição

function buildModuleViews(modules: Module[], progress: UserProgress[]): ModuleProgressView[] {
  const byId = new Map(progress.map((p) => [p.moduleId, p]));
  return [...modules]
    .sort((a, b) => a.order - b.order)
    .map((m) => {
      const p = byId.get(m.id);
      const completed = p?.completedLessons ?? 0;
      const percent = m.totalLessons === 0 ? 0 : Math.round((completed / m.totalLessons) * 100);
      return {
        module: m,
        completedLessons: completed,
        percent,
        isCompleted: percent >= 100,
        lastAccessedAt: p?.lastAccessedAt ?? null,
      };
    });
}

function buildEncouragement(overall: number, lastCompletedTitle: string | null, courseTitle: string, remainingModules: number): string {
  if (overall >= 100) {
    return `Você conseguiu! Concluiu toda a sua jornada no curso ${courseTitle}. Olhe para trás e orgulhe-se de cada hora dedicada!`;
  }
  if (overall >= 75) {
    return "Reta final! Você construiu uma rotina incrível até aqui. Só mais um pouco para consolidar essa virada de carreira.";
  }
  if (overall >= 50) {
    return `Você já passou da metade do caminho! Faltam apenas ${remainingModules} módulos. Seu esforço está valendo a pena.`;
  }
  if (overall >= 25) {
    const name = lastCompletedTitle ?? "o primeiro módulo";
    return `O primeiro passo é o mais difícil, e você já deu! Módulo ${name} concluído com sucesso. Vamos para o próximo?`;
  }
  return "Toda jornada começa com um pequeno passo. Que tal 10 minutinhos hoje? A gente caminha com você.";
}

function estimateWeeksRemaining(
  views: ModuleProgressView[],
  progress: UserProgress[],
  paceHoursPerWeek: number,
): number {
  const totalLessons = views.reduce((s, v) => s + v.module.totalLessons, 0);
  const completedLessons = views.reduce((s, v) => s + v.completedLessons, 0);
  const remainingLessons = Math.max(0, totalLessons - completedLessons);
  if (remainingLessons === 0) return 0;

  // velocidade histórica baseada em módulos concluídos
  const completedProgress = progress.filter((p) => p.completedAt && p.lastAccessedAt);
  let hoursPerLesson = HOURS_PER_LESSON;
  if (completedProgress.length >= 1) {
    const totals = completedProgress.map((p) => {
      const ms = (p.completedAt!.getTime() - p.lastAccessedAt!.getTime());
      const days = Math.max(1, Math.abs(ms) / (1000 * 60 * 60 * 24));
      // assume ~paceHoursPerWeek de estudo durante esse período
      const estimatedHours = (days / 7) * paceHoursPerWeek;
      const mod = views.find((v) => v.module.id === p.moduleId);
      const lessons = mod?.module.totalLessons ?? 1;
      return estimatedHours / Math.max(1, lessons);
    });
    const avg = totals.reduce((s, x) => s + x, 0) / totals.length;
    if (avg > 0.15 && avg < 3) hoursPerLesson = avg;
  }

  const remainingHours = remainingLessons * hoursPerLesson;
  const weeks = remainingHours / Math.max(1, paceHoursPerWeek);
  return Math.max(1, Math.ceil(weeks));
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor(Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function buildResumeContext(views: ModuleProgressView[]) {
  const inProgress = views
    .filter((v) => !v.isCompleted && v.completedLessons > 0 && v.lastAccessedAt)
    .sort((a, b) => (b.lastAccessedAt!.getTime() - a.lastAccessedAt!.getTime()))[0];
  if (!inProgress) return null;
  return {
    moduleTitle: inProgress.module.title,
    lessonNumber: inProgress.completedLessons + 1,
    daysSince: daysBetween(new Date(), inProgress.lastAccessedAt!),
  };
}

function buildBadges(progress: UserProgress[]): SoftSkillBadge[] {
  const hasWeekend = progress.some((p) => {
    if (!p.lastAccessedAt) return false;
    const d = p.lastAccessedAt.getDay();
    return d === 0 || d === 6;
  });
  const hasEarly = progress.some((p) => p.lastAccessedAt && p.lastAccessedAt.getHours() < 8);
  const comeback = progress.some((p) => {
    if (!p.lastAccessedAt || !p.completedAt) return false;
    const gap = daysBetween(p.lastAccessedAt, p.completedAt);
    return gap >= 5;
  });
  const consistency = progress.filter((p) => p.completedAt).length >= 2;
  return [
    { id: "weekend", icon: "weekend", label: "Guerreiro de Fim de Semana", description: "Estudou em um sábado ou domingo.", earned: hasWeekend },
    { id: "early", icon: "early", label: "Madrugador(a)", description: "Estudou antes das 8h da manhã.", earned: hasEarly },
    { id: "comeback", icon: "comeback", label: "Persistência", description: "Voltou a estudar após uma pausa de 5+ dias.", earned: comeback },
    { id: "consistency", icon: "consistency", label: "Ritmo Próprio", description: "Concluiu 2 módulos no seu tempo.", earned: consistency },
  ];
}

export function computeProgressSummary(
  course: Course,
  modules: Module[],
  progress: UserProgress[],
  pace: PaceMode,
): ProgressSummary {
  const views = buildModuleViews(modules, progress);
  const totalLessons = views.reduce((s, v) => s + v.module.totalLessons, 0);
  const completedLessons = views.reduce((s, v) => s + v.completedLessons, 0);
  const overallPercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  const remainingModules = views.filter((v) => !v.isCompleted).length;
  const lastCompleted = [...views].reverse().find((v) => v.isCompleted)?.module.title ?? null;
  const encouragement = buildEncouragement(overallPercent, lastCompleted, course.title, remainingModules);

  const paceHoursPerWeek = PACE_HOURS[pace];
  const estimatedWeeksRemaining = estimateWeeksRemaining(views, progress, paceHoursPerWeek);

  const weeklyGoalMinutes = paceHoursPerWeek * 60;
  const weeklyCurrentMinutes = Math.round(weeklyGoalMinutes * 0.6);

  return {
    course,
    overallPercent,
    totalLessons,
    completedLessons,
    modules: views,
    estimatedWeeksRemaining,
    pace,
    paceHoursPerWeek,
    encouragement,
    resumeContext: buildResumeContext(views),
    weeklyEnergy: { current: weeklyCurrentMinutes, goal: weeklyGoalMinutes },
    badges: buildBadges(progress),
  };
}