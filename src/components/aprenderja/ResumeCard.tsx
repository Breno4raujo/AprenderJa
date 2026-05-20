import { ArrowRight, Coffee } from "lucide-react";

interface Props {
  context: { moduleTitle: string; lessonNumber: number; daysSince: number } | null;
  onResume: () => void;
}

export function ResumeCard({ context, onResume }: Props) {
  if (!context) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
        Quando você começar uma lição, ela aparece aqui para você retomar com 1 clique.
      </div>
    );
  }
  const { moduleTitle, lessonNumber, daysSince } = context;
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-soft flex items-center gap-4">
      <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0">
        <Coffee className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Retomar de onde parou</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Você parou na lição {lessonNumber} de “{moduleTitle}”
          {daysSince > 0 ? ` há ${daysSince} ${daysSince === 1 ? "dia" : "dias"}` : " hoje"}.{" "}
          Que tal 10 minutinhos agora?
        </p>
      </div>
      <button
        onClick={onResume}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition shrink-0"
      >
        Retomar <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}