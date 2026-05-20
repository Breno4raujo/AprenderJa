import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/aprenderja/DashboardLayout";
import { OverallProgressCard } from "@/components/aprenderja/OverallProgressCard";
import { ModuleList } from "@/components/aprenderja/ModuleList";
import { CelebrationModal } from "@/components/aprenderja/CelebrationModal";
import { ResumeCard } from "@/components/aprenderja/ResumeCard";
import { PaceSelector } from "@/components/aprenderja/PaceSelector";
import { BadgesShowcase } from "@/components/aprenderja/BadgesShowcase";
import { WeeklyEnergy } from "@/components/aprenderja/WeeklyEnergy";
import { mockCourse, mockModules, mockUser, initialProgress } from "@/lib/aprenderja/mockData";
import { computeProgressSummary } from "@/lib/aprenderja/progress";
import type { PaceMode, UserProgress } from "@/lib/aprenderja/types";

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

  const summary = useMemo(
    () => computeProgressSummary(mockCourse, mockModules, progress, pace),
    [progress, pace],
  );

  const handleAdvance = (moduleId: string) => {
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
      }
      return next;
    });
  };

  const handleResume = () => {
    const inProgress = summary.modules.find((m) => !m.isCompleted && m.completedLessons > 0);
    if (inProgress) handleAdvance(inProgress.module.id);
  };

  return (
    <DashboardLayout userName={mockUser.name}>
      <OverallProgressCard summary={summary} />

      <ResumeCard context={summary.resumeContext} onResume={handleResume} />

      <div className="grid lg:grid-cols-2 gap-4">
        <PaceSelector pace={pace} onChange={setPace} />
        <WeeklyEnergy current={summary.weeklyEnergy.current} goal={summary.weeklyEnergy.goal} />
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
