import { createAPIFileRoute } from "@tanstack/start/api";
import { prisma } from "@/lib/db";
import { verifyPassword, signJwt } from "@/lib/auth";
import { jsonOk, jsonError } from "@/lib/api";

export const APIRoute = createAPIFileRoute("/api/auth/login")({
  POST: async ({ request }) => {
    try {
      const body = await request.json() as { email?: string; password?: string };
      const { email, password } = body;

      if (!email || !password) return jsonError("E-mail e senha são obrigatórios.");

      const normalizedEmail = email.toLowerCase().trim();

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, name: true, email: true, passwordHash: true, createdAt: true },
      });

      if (!user) return jsonError("E-mail ou senha incorretos.", 401);

      const passwordOk = await verifyPassword(password, user.passwordHash);
      if (!passwordOk) return jsonError("E-mail ou senha incorretos.", 401);

      const secret = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
      const token = await signJwt({ sub: user.id, email: user.email, name: user.name }, secret);

      const { passwordHash: _omit, ...publicUser } = user;

      return jsonOk({ token, user: publicUser });
    } catch (err) {
      console.error("[POST /api/auth/login]", err);
      return jsonError("Erro interno do servidor.", 500);
    }
  },
});