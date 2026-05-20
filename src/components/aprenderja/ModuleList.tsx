import { CheckCircle2, Circle, PlayCircle, Award } from "lucide-react";
import type { ModuleProgressView } from "@/lib/aprenderja/types";

interface Props {
  modules: ModuleProgressView[];
  onAdvance: (moduleId: string) => void;
}

export function ModuleList({ modules, onAdvance }: Props) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-lg font-semibold tracking-tight">Seus módulos</h2>
        <p className="text-xs text-muted-foreground">
          {modules.filter((m) => m.isCompleted).length} de {modules.length} concluídos
        </p>
      </div>

      <ul className="space-y-3">
        {modules.map((m) => (
          <li
            key={m.module.id}
            className={`rounded-2xl border bg-card p-4 sm:p-5 shadow-soft transition-all duration-300 ${
              m.isCompleted ? "border-accent/40 bg-accent-soft/40" : "border-border hover:border-primary/30"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`h-10 w-10 shrink-0 rounded-xl grid place-items-center transition-colors ${
                  m.isCompleted
                    ? "bg-accent text-accent-foreground"
                    : m.completedLessons > 0
                      ? "bg-primary-soft text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {m.isCompleted ? (
                  <Award className="h-5 w-5" />
                ) : m.completedLessons > 0 ? (
                  <PlayCircle className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium truncate">
                    <span className="text-muted-foreground mr-2">{String(m.module.order).padStart(2, "0")}</span>
                    {m.module.title}
                  </p>
                  {m.isCompleted && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                      <CheckCircle2 className="h-3 w-3" /> Conquistado
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {m.completedLessons} de {m.module.totalLessons} lições · {m.percent}%
                </p>
              </div>
              {!m.isCompleted && (
                <button
                  onClick={() => onAdvance(m.module.id)}
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition shrink-0"
                >
                  {m.completedLessons === 0 ? "Começar" : "Avançar"}
                </button>
              )}
            </div>

            <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-[width] duration-700 ease-out ${
                  m.isCompleted ? "bg-accent" : "bg-gradient-primary"
                }`}
                style={{ width: `${m.percent}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}