import { Sun, Moon, Heart, Trophy, Lock } from "lucide-react";
import type { SoftSkillBadge } from "@/lib/aprenderja/types";

const ICONS = {
  weekend: Sun,
  early: Moon,
  comeback: Heart,
  consistency: Trophy,
} as const;

interface Props { badges: SoftSkillBadge[] }

export function BadgesShowcase({ badges }: Props) {
  return (
    <section className="rounded-2xl bg-card border border-border p-5 shadow-soft">
      <div className="flex items-baseline justify-between">
        <div>
          <h3 className="font-semibold tracking-tight">Conquistas invisíveis</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Reconhecimento pelo esforço real — não só pela nota.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {badges.filter((b) => b.earned).length}/{badges.length}
        </p>
      </div>
      <ul className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {badges.map((b) => {
          const Icon = ICONS[b.icon];
          return (
            <li
              key={b.id}
              className={`rounded-xl border p-3 text-center transition ${
                b.earned
                  ? "border-accent/40 bg-accent-soft/50"
                  : "border-dashed border-border bg-background/60 opacity-70"
              }`}
            >
              <div
                className={`mx-auto h-9 w-9 rounded-full grid place-items-center ${
                  b.earned ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {b.earned ? <Icon className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
              </div>
              <p className="mt-2 text-xs font-medium leading-tight">{b.label}</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{b.description}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}