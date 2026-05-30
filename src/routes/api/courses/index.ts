import { createAPIFileRoute } from "@tanstack/start/api";
import { prisma } from "@/lib/db";
import { verifyJwt, extractBearerToken, unauthorizedResponse } from "@/lib/auth";
import { jsonOk, jsonError } from "@/lib/api";

export const APIRoute = createAPIFileRoute("/api/courses")({
  GET: async ({ request }) => {
    try {
      const token = extractBearerToken(request);
      if (!token) return unauthorizedResponse();

      const secret = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
      const payload = await verifyJwt(token, secret);
      if (!payload) return unauthorizedResponse("Token inválido ou expirado.");

      const courses = await prisma.course.findMany({
        include: { modules: { orderBy: { order: "asc" } } },
        orderBy: { title: "asc" },
      });

      return jsonOk({ courses });
    } catch (err) {
      console.error("[GET /api/courses]", err);
      return jsonError("Erro interno do servidor.", 500);
    }
  },
});