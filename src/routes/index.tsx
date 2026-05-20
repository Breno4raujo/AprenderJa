import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/aprenderja/DashboardLayout";
import { OverallProgressCard } from "@/components/aprenderja/OverallProgressCard";
import { ModuleList } from "@/components/aprenderja/ModuleList";
import { CelebrationModal } from "@/components/aprenderja/CelebrationModal";
import { ResumeCard } from "@/components/aprenderja/ResumeCard";
import { PaceSelector } from "@/components/aprenderja/PaceSelector";
import { BadgesShowcase } from "@/components/aprenderja/BadgesShowcase";
import { WeeklyEnergy } from "@/components/aprenderja/WeeklyEnergy";
import { MicroHabitCard } from "@/components/aprenderja/MicroHabitCard";
import { VictoriesWall } from "@/components/aprenderja/VictoriesWall";
import { ImpactCalculator } from "@/components/aprenderja/ImpactCalculator";
import { PauseWeek } from "@/components/aprenderja/PauseWeek";
import { mockCourse, mockModules, mockUser, initialProgress } from "@/lib/aprenderja/mockData";
import { computeProgressSummary } from "@/lib/aprenderja/progress";
import type { PaceMode, UserProgress, Victory } from "@/lib/aprenderja/types";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "AprenderJá — Sua nova carreira, no seu ritmo" },
      {
        name: "description",
        content:
          "Plataforma de requalificação profissional para adultos. Aprenda no seu tempo, celebre cada conquista.",
      },
    ],
  }),
});

function Dashboard() {
  const [progress, setProgress] = useState<UserProgress[]>(initialProgress);
  const [pace, setPace] = useState<PaceMode>("focado");
  const [celebrating, setCelebrating] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [victories, setVictories] = useState<Victory[]>([]);

  const summary = useMemo(
    () => computeProgressSummary(mockCourse, mockModules, progress, pace),
    [progress, pace],
  );

  // Seed victories from already-completed modules + current milestone on mount.
  useEffect(() => {
    const seeded: Victory[] = summary.modules
      .filter((m) => m.isCompleted)
      .map((m) => ({
        id: `seed-${m.module.id}`,
        kind: "module" as const,
        title: `Módulo conquistado: ${m.module.title}`,
        message: "Você concluiu este módulo no seu tempo. Esse passo ficou registrado.",
        earnedAt: m.lastAccessedAt ?? new Date(),
      }));
    if (summary.overallPercent >= 25) {
      seeded.push({
        id: "seed-milestone",
        kind: "milestone",
        title: `Marco de ${summary.overallPercent}% atingido`,
        message: summary.encouragement,
        earnedAt: new Date(),
      });
    }
    setVictories(seeded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resumeOn = useMemo(() => {
    if (!paused) return null;
    const d = new Date();
    const day = d.getDay();
    const daysUntilMonday = day === 0 ? 1 : 8 - day;
    d.setDate(d.getDate() + daysUntilMonday);
    return d;
  }, [paused]);

  const remainingLessons = summary.totalLessons - summary.completedLessons;
  const minutesPerLessonFromPace = Math.round((summary.paceHoursPerWeek * 60) / Math.max(1, remainingLessons / 4)) || 30;

  const handleAdvance = (moduleId: string) => {
    const prevPercent = summary.overallPercent;
    setProgress((prev) => {
      const next = prev.map((p) => ({ ...p }));
      const mod = mockModules.find((m) => m.id === moduleId);
      const entry = next.find((p) => p.moduleId === moduleId);
      if (!mod || !entry) return prev;
      if (entry.completedLessons >= mod.totalLessons) return prev;
      entry.completedLessons += 1;
      entry.lastAccessedAt = new Date();
      if (entry.completedLessons >= mod.totalLessons) {
        entry.completedAt = new Date();
        setCelebrating(mod.title);
        setVictories((vs) => [
          ...vs,
          {
            id: `v-${mod.id}-${Date.now()}`,
            kind: "module",
            title: `Módulo conquistado: ${mod.title}`,
            message:
              "Que orgulho! Mais um passo firme na sua virada de carreira. Esse momento ficou guardado aqui.",
            earnedAt: new Date(),
          },
        ]);
      }
      return next;
    });
    // Milestone victory check (25/50/75/100)
    setTimeout(() => {
      const newSummary = computeProgressSummary(mockCourse, mockModules, progress.map((p) => p.moduleId === moduleId ? { ...p, completedLessons: Math.min((p.completedLessons || 0) + 1, mockModules.find((m) => m.id === moduleId)?.totalLessons ?? 0) } : p), pace);
      const newPercent = newSummary.overallPercent;
      const crossed = [25, 50, 75, 100].find((m) => prevPercent < m && newPercent >= m);
      if (crossed) {
        setVictories((vs) => [
          ...vs,
          {
            id: `m-${crossed}-${Date.now()}`,
            kind: "milestone",
            title: `Marco de ${crossed}% conquistado`,
            message: newSummary.encouragement,
            earnedAt: new Date(),
          },
        ]);
      }
    }, 0);
  };

  const handleResume = () => {
    const inProgress = summary.modules.find((m) => !m.isCompleted && m.completedLessons > 0);
    if (inProgress) handleAdvance(inProgress.module.id);
  };

  const currentInProgress = summary.modules.find((m) => !m.isCompleted && m.completedLessons > 0)
    ?? summary.modules.find((m) => !m.isCompleted);

  return (
    <DashboardLayout userName={mockUser.name}>
      <OverallProgressCard summary={summary} />

      <PauseWeek paused={paused} resumeOn={resumeOn} onToggle={() => setPaused((p) => !p)} />

      <MicroHabitCard
        moduleTitle={currentInProgress?.module.title ?? null}
        lessonNumber={currentInProgress ? currentInProgress.completedLessons + 1 : null}
        minutesToday={Math.round((summary.paceHoursPerWeek * 60) / 7)}
        paused={paused}
        onStart={handleResume}
      />

      <ResumeCard context={summary.resumeContext} onResume={handleResume} />

      <div className="grid lg:grid-cols-2 gap-4">
        <PaceSelector pace={pace} onChange={setPace} />
        <WeeklyEnergy current={summary.weeklyEnergy.current} goal={summary.weeklyEnergy.goal} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ImpactCalculator
          remainingLessons={remainingLessons}
          minutesPerLesson={Math.min(45, Math.max(15, minutesPerLessonFromPace))}
        />
        <VictoriesWall victories={victories} />
      </div>

      <ModuleList modules={summary.modules} onAdvance={handleAdvance} />

      <BadgesShowcase badges={summary.badges} />

      <CelebrationModal
        open={celebrating !== null}
        moduleTitle={celebrating}
        onClose={() => setCelebrating(null)}
      />
    </DashboardLayout>
  );
}
