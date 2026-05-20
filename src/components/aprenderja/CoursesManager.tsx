import { useState } from "react";
import { BookPlus, Check, Plus, Trash2, GraduationCap } from "lucide-react";
import type { Course, Module } from "@/lib/aprenderja/types";

interface Props {
  courses: Course[];
  modulesByCourse: Record<string, Module[]>;
  activeCourseId: string;
  onSelect: (courseId: string) => void;
  onAdd: (course: Course, modules: Module[]) => void;
  onRemove: (courseId: string) => void;
}

interface DraftModule {
  title: string;
  totalLessons: number;
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function CoursesManager({
  courses,
  modulesByCourse,
  activeCourseId,
  onSelect,
  onAdd,
  onRemove,
}: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [drafts, setDrafts] = useState<DraftModule[]>([
    { title: "", totalLessons: 6 },
  ]);

  const totalLessons = drafts.reduce((s, d) => s + (Number(d.totalLessons) || 0), 0);
  const estWeeks = weeklyHours > 0 ? Math.max(1, Math.ceil((totalLessons * 0.5) / weeklyHours)) : 0;

  function updateDraft(idx: number, patch: Partial<DraftModule>) {
    setDrafts((arr) => arr.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  }
  function addDraft() {
    setDrafts((arr) => [...arr, { title: "", totalLessons: 6 }]);
  }
  function removeDraft(idx: number) {
    setDrafts((arr) => (arr.length <= 1 ? arr : arr.filter((_, i) => i !== idx)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanModules = drafts
      .map((d) => ({ title: d.title.trim(), totalLessons: Math.max(1, Number(d.totalLessons) || 1) }))
      .filter((d) => d.title.length > 0);
    if (!title.trim() || cleanModules.length === 0) return;
    const courseId = makeId("c");
    const newCourse: Course = {
      id: courseId,
      title: title.trim(),
      description: description.trim() || "Sua nova jornada de aprendizado.",
      totalModules: cleanModules.length,
    };
    const newModules: Module[] = cleanModules.map((m, i) => ({
      id: makeId("m"),
      courseId,
      title: m.title,
      order: i + 1,
      totalLessons: m.totalLessons,
    }));
    onAdd(newCourse, newModules);
    setTitle("");
    setDescription("");
    setWeeklyHours(5);
    setDrafts([{ title: "", totalLessons: 6 }]);
    setOpen(false);
  }

  return (
    <section className="rounded-2xl bg-card border border-border p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold tracking-tight">Meus cursos</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cadastre os cursos que você está fazendo e o ritmo previsto de cada um.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium px-3 py-2 hover:opacity-90 transition"
        >
          <BookPlus className="h-3.5 w-3.5" />
          {open ? "Fechar" : "Novo curso"}
        </button>
      </div>

      <ul className="mt-4 grid sm:grid-cols-2 gap-3">
        {courses.map((c) => {
          const mods = modulesByCourse[c.id] ?? [];
          const lessons = mods.reduce((s, m) => s + m.totalLessons, 0);
          const active = c.id === activeCourseId;
          return (
            <li
              key={c.id}
              className={`rounded-xl border p-3 transition ${
                active ? "border-primary bg-primary-soft/40" : "border-border bg-background/60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{c.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                    {c.description}
                  </p>
                </div>
                {active && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-background rounded-full px-2 py-0.5 border border-primary/30 shrink-0">
                    <Check className="h-3 w-3" /> Ativo
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                {mods.length} módulos · {lessons} lições
              </p>
              <div className="mt-3 flex items-center gap-2">
                {!active && (
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    Tornar ativo
                  </button>
                )}
                {courses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemove(c.id)}
                    className="ml-auto text-[11px] text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> Remover
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="mt-5 rounded-xl border border-dashed border-border bg-background/60 p-4 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Nome do curso</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: Inglês para o Trabalho"
                className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Horas por semana previstas</span>
              <input
                type="number"
                min={1}
                max={40}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Descrição (opcional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="O que você espera aprender neste curso?"
              rows={2}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Módulos</span>
              <button
                type="button"
                onClick={addDraft}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
              >
                <Plus className="h-3 w-3" /> Adicionar módulo
              </button>
            </div>
            <ul className="mt-2 space-y-2">
              {drafts.map((d, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground w-5 text-center tabular-nums">
                    {i + 1}.
                  </span>
                  <input
                    type="text"
                    value={d.title}
                    onChange={(e) => updateDraft(i, { title: e.target.value })}
                    placeholder="Título do módulo"
                    className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={d.totalLessons}
                      onChange={(e) => updateDraft(i, { totalLessons: Number(e.target.value) })}
                      className="w-16 rounded-lg border border-border bg-card px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <span className="text-[11px] text-muted-foreground">lições</span>
                  </div>
                  {drafts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDraft(i)}
                      className="text-muted-foreground hover:text-destructive p-1"
                      aria-label="Remover módulo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg bg-primary-soft/50 border border-primary/15 p-3 text-xs text-foreground">
            Estimativa: <span className="font-semibold">{totalLessons} lições</span> ·{" "}
            <span className="font-semibold">~{estWeeks} {estWeeks === 1 ? "semana" : "semanas"}</span>{" "}
            com {weeklyHours} h/semana.
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs px-3 py-2 rounded-lg border border-border hover:bg-background"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
            >
              <Check className="h-3.5 w-3.5" /> Salvar curso
            </button>
          </div>
        </form>
      )}
    </section>
  );
}