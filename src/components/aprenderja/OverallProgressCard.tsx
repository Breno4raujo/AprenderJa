import { Clock } from "lucide-react";
import type { ProgressSummary } from "@/lib/aprenderja/types";

interface Props {
  summary: ProgressSummary;
}

export function OverallProgressCard({ summary }: Props) {
  const { overallPercent, course, estimatedWeeksRemaining, encouragement } = summary;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overallPercent / 100) * circumference;

  return (
    <section className="rounded-3xl bg-card border border-border shadow-soft overflow-hidden">
      <div className="bg-gradient-primary px-6 sm:px-8 py-6 text-primary-foreground">
        <p className="text-xs uppercase tracking-wider opacity-80">Sua jornada</p>
        <h1 className="text-xl sm:text-2xl font-semibold mt-1">{course.title}</h1>
        <p className="text-sm opacity-90 mt-1 max-w-xl">{course.description}</p>
      </div>

      <div className="px-6 sm:px-8 py-6 grid sm:grid-cols-[auto,1fr] gap-6 items-center">
        <div className="relative h-36 w-36 mx-auto sm:mx-0">
          <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--color-muted)" strokeWidth="12" />
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.2,0.9,0.3,1.2)" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{overallPercent}%</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">concluído</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2 text-sm">
            <Clock className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <p className="text-foreground">
              {estimatedWeeksRemaining === 0 ? (
                <>Você concluiu tudo. Hora de comemorar! 🎉</>
              ) : (
                <>
                  No seu ritmo atual, você conquista seu objetivo em aproximadamente{" "}
                  <span className="font-semibold text-primary">
                    {estimatedWeeksRemaining} {estimatedWeeksRemaining === 1 ? "semana" : "semanas"}
                  </span>
                  !
                </>
              )}
            </p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{encouragement}</p>
        </div>
      </div>
    </section>
  );
}