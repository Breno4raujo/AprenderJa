import { createAPIFileRoute } from "@tanstack/start/api";
import { prisma } from "@/lib/db";
import { verifyJwt, extractBearerToken, unauthorizedResponse } from "@/lib/auth";
import { jsonOk, jsonError } from "@/lib/api";

export const APIRoute = createAPIFileRoute("/api/progress/lesson")({
  POST: async ({ request }) => {
    try {
      const token = extractBearerToken(request);
      if (!token) return unauthorizedResponse();

      const secret = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
      const payload = await verifyJwt(token, secret);
      if (!payload) return unauthorizedResponse("Token inválido ou expirado.");

      const body = await request.json() as { moduleId?: string };
      const { moduleId } = body;

      if (!moduleId || typeof moduleId !== "string")
        return jsonError("moduleId é obrigatório.");

      const module = await prisma.module.findUnique({ where: { id: moduleId } });
      if (!module) return jsonError("Módulo não encontrado.", 404);

      const existing = await prisma.userProgress.findUnique({
        where: { userId_moduleId: { userId: payload.sub, moduleId } },
      });

      const currentLessons = existing?.completedLessons ?? 0;

      if (currentLessons >= module.totalLessons) {
        return jsonOk({ message: "Módulo já concluído.", progress: existing, moduleCompleted: true });
      }

      const newCompleted = currentLessons + 1;
      const isModuleCompleted = newCompleted >= module.totalLessons;
      const now = new Date();

      const updated = await prisma.userProgress.upsert({
        where: { userId_moduleId: { userId: payload.sub, moduleId } },
        create: {
          userId: payload.sub,
          moduleId,
          completedLessons: newCompleted,
          lastAccessedAt: now,
          completedAt: isModuleCompleted ? now : null,
        },
        update: {
          completedLessons: newCompleted,
          lastAccessedAt: now,
          completedAt: isModuleCompleted ? now : undefined,
        },
      });

      return jsonOk({
        message: isModuleCompleted
          ? `Parabéns! Você concluiu o módulo "${module.title}"!`
          : `Lição ${newCompleted} de ${module.totalLessons} concluída.`,
        progress: updated,
        moduleCompleted: isModuleCompleted,
        moduleTitle: module.title,
        lessonNumber: newCompleted,
        totalLessons: module.totalLessons,
        percentComplete: Math.round((newCompleted / module.totalLessons) * 100),
      });
    } catch (err) {
      console.error("[POST /api/progress/lesson]", err);
      return jsonError("Erro interno do servidor.", 500);
    }
  },
});