import { createAPIFileRoute } from "@tanstack/start/api";
import { prisma } from "@/lib/db";
import { hashPassword, signJwt } from "@/lib/auth";
import { jsonOk, jsonError } from "@/lib/api";

export const APIRoute = createAPIFileRoute("/api/auth/register")({
  POST: async ({ request }) => {
    try {
      const body = await request.json() as { name?: string; email?: string; password?: string };
      const { name, email, password } = body;

      if (!name || typeof name !== "string" || name.trim().length < 2)
        return jsonError("Nome deve ter pelo menos 2 caracteres.");
      if (!email || typeof email !== "string" || !email.includes("@"))
        return jsonError("E-mail inválido.");
      if (!password || typeof password !== "string" || password.length < 6)
        return jsonError("A senha deve ter pelo menos 6 caracteres.");

      const normalizedEmail = email.toLowerCase().trim();

      const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existing) return jsonError("E-mail já cadastrado.", 409);

      const passwordHash = await hashPassword(password);
      const user = await prisma.user.create({
        data: { name: name.trim(), email: normalizedEmail, passwordHash },
        select: { id: true, name: true, email: true, createdAt: true },
      });

      const secret = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
      const token = await signJwt({ sub: user.id, email: user.email, name: user.name }, secret);

      return jsonOk({ token, user }, 201);
    } catch (err) {
      console.error("[POST /api/auth/register]", err);
      return jsonError("Erro interno do servidor.", 500);
    }
  },
});