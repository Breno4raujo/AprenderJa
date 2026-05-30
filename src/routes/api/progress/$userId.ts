import { createAPIFileRoute } from "@tanstack/start/api";
import { prisma } from "@/lib/db";
import { verifyJwt, extractBearerToken, unauthorizedResponse } from "@/lib/auth";
import { jsonOk, jsonError } from "@/lib/api";
import { computeProgressSummary } from "@/lib/aprenderja/progress";
import type { PaceMode } from "@/lib/aprenderja/types";

export const APIRoute = createAPIFileRoute("/api/progress/$userId")({
  GET: async ({ request, params }) => {
    try {
      const token = extractBearerToken(request);
      if (!token) return unauthorizedResponse();

      const secret = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
      const payload = await verifyJwt(token, secret);
      if (!payload) return unauthorizedResponse("Token inválido ou expirado.");

      if (payload.sub !== params.userId)
        return jsonError("Acesso negado.", 403);

      const url = new URL(request.url);
      const courseId = url.searchParams.get("courseId");
      const pace = (url.searchParams.get("pace") ?? "focado") as PaceMode;

      const validPaces: PaceMode[] = ["leve", "focado", "intenso"];
      if (!validPaces.includes(pace))
        return jsonError("Pace inválido. Use: leve, focado ou intenso.");

      const courses = await prisma.course.findMany({
        where: courseId ? { id: courseId } : undefined,
        include: { modules: { orderBy: { order: "asc" } } },
      });

      if (courses.length === 0) return jsonError("Nenhum curso encontrado.", 404);

      const moduleIds = courses.flatMap((c) => c.modules.map((m) => m.id));
      const progressRecords = await prisma.userProgress.findMany({
        where: { userId: params.userId, moduleId: { in: moduleIds } },
      });

      const summaries = courses.map((course) => {
        const modules = course.modules;
        const progressForSummary = modules.map((mod) => {
          const existing = progressRecords.find((p) => p.moduleId === mod.id);
          return {
            id: existing?.id ?? `auto-${mod.id}`,
            userId: params.userId,
            moduleId: mod.id,
            completedLessons: existing?.completedLessons ?? 0,
            lastAccessedAt: existing?.lastAccessedAt ?? null,
            completedAt: existing?.completedAt ?? null,
          };
        });
        return computeProgressSummary(course, modules, progressForSummary, pace);
      });

      return jsonOk({
        userId: params.userId,
        pace,
        summaries,
        global: {
          totalCourses: summaries.length,
          completedCourses: summaries.filter((s) => s.overallPercent === 100).length,
          averageProgress: Math.round(
            summaries.reduce((acc, s) => acc + s.overallPercent, 0) / summaries.length,
          ),
        },
      });
    } catch (err) {
      console.error("[GET /api/progress/:userId]", err);
      return jsonError("Erro interno do servidor.", 500);
    }
  },
});