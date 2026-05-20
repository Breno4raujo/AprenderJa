import { Pause, Play, CalendarCheck } from "lucide-react";

interface Props {
  paused: boolean;
  resumeOn: Date | null;
  onToggle: () => void;
}

export function PauseWeek({ paused, resumeOn, onToggle }: Props) {
  return (
    <section
      className={`rounded-2xl border p-5 shadow-soft transition-colors ${
        paused ? "border-accent/40 bg-accent-soft/40" : "border-border bg-card"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`h-10 w-10 rounded-xl grid place-items-center shrink-0 ${
            paused ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {paused ? <CalendarCheck className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold tracking-tight text-sm">
            {paused ? "Sua semana está em pausa programada" : "Semana corrida no trabalho?"}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
            {paused && resumeOn ? (
              <>
                Entendido! Sua meta está congelada. Te esperamos na{" "}
                <span className="font-medium text-foreground">
                  {resumeOn.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
                </span>
                , sem pressa nem culpa.
              </>
            ) : (
              <>
                Avise a plataforma e congelamos sua meta sem cobrança. A vida adulta acontece — a gente entende.
              </>
            )}
          </p>
        </div>
        <button
          onClick={onToggle}
          className={`text-xs font-semibold px-3.5 py-2 rounded-full transition shrink-0 inline-flex items-center gap-1.5 ${
            paused
              ? "bg-foreground text-background hover:opacity-90"
              : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
        >
          {paused ? (
            <>
              <Play className="h-3.5 w-3.5" /> Retomar agora
            </>
          ) : (
            <>
              <Pause className="h-3.5 w-3.5" /> Pausar a semana
            </>
          )}
        </button>
      </div>
    </section>
  );
}