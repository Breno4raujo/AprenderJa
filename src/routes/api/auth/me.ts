import { createAPIFileRoute } from "@tanstack/start/api";
import { prisma } from "@/lib/db";
import { verifyJwt, extractBearerToken, unauthorizedResponse } from "@/lib/auth";
import { jsonOk, jsonError } from "@/lib/api";

export const APIRoute = createAPIFileRoute("/api/auth/me")({
  GET: async ({ request }) => {
    try {
      const token = extractBearerToken(request);
      if (!token) return unauthorizedResponse();

      const secret = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
      const payload = await verifyJwt(token, secret);
      if (!payload) return unauthorizedResponse("Token inválido ou expirado.");

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, name: true, email: true, createdAt: true },
      });

      if (!user) return unauthorizedResponse("Usuário não encontrado.");

      return jsonOk({ user });
    } catch (err) {
      console.error("[GET /api/auth/me]", err);
      return jsonError("Erro interno do servidor.", 500);
    }
  },
});