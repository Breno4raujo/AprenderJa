import { Battery } from "lucide-react";

interface Props { current: number; goal: number }

export function WeeklyEnergy({ current, goal }: Props) {
  const pct = Math.min(100, Math.round((current / goal) * 100));
  const reached = current >= goal;
  return (
    <section className="rounded-2xl bg-card border border-border p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-xl grid place-items-center ${reached ? "bg-success text-success-foreground" : "bg-primary-soft text-primary"}`}>
          <Battery className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold tracking-tight text-sm">Carga de energia semanal</h3>
          <p className="text-xs text-muted-foreground">
            Sem ofensivas diárias. Bata a meta na semana, como der.
          </p>
        </div>
        <p className="text-sm font-medium tabular-nums">
          {current}<span className="text-muted-foreground">/{goal} min</span>
        </p>
      </div>
      <div className="mt-4 h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out ${reached ? "bg-success" : "bg-gradient-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {reached ? "Meta da semana conquistada — descanse com orgulho." : `Faltam ${goal - current} minutos para fechar a semana.`}
      </p>
    </section>
  );
}