const ALGORITHM = "HS256";
const TOKEN_EXPIRY_HOURS = 24;

function base64UrlEncode(data: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(data)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "==".slice(0, (4 - (base64.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

async function getSigningKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export async function signJwt(
  payload: Omit<JwtPayload, "iat" | "exp">,
  secret: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + TOKEN_EXPIRY_HOURS * 3600,
  };

  const encoder = new TextEncoder();
  const header = base64UrlEncode(encoder.encode(JSON.stringify({ alg: ALGORITHM, typ: "JWT" })));
  const body = base64UrlEncode(encoder.encode(JSON.stringify(fullPayload)));
  const data = `${header}.${body}`;

  const key = await getSigningKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));

  return `${data}.${base64UrlEncode(signature)}`;
}

export async function verifyJwt(token: string, secret: string): Promise<JwtPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, body, sig] = parts;
    const data = `${header}.${body}`;

    const key = await getSigningKey(secret);
    const encoder = new TextEncoder();
    const valid = await crypto.subtle.verify("HMAC", key, base64UrlDecode(sig), encoder.encode(data));
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(body))) as JwtPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

export function extractBearerToken(request: Request): string | null {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

export async function hashPassword(password: string, salt?: string): Promise<string> {
  const s = salt ?? crypto.randomUUID().replace(/-/g, "");
  const encoder = new TextEncoder();
  const data = encoder.encode(`${s}:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${s}:${hex}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt] = stored.split(":");
  const rehashed = await hashPassword(password, salt);
  return rehashed === stored;
}

export function unauthorizedResponse(message = "Não autorizado"): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}