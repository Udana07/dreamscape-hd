import { authConfigured, endSession, isAdmin, sameOrigin, startSession, validPassword } from "@/server/auth";
import { readJSON, writeJSON } from "@/server/storage";
import { createHash } from "node:crypto";

export async function GET() {
  return Response.json({ authenticated: await isAdmin(), configured: authConfigured() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
  if (!authConfigured()) return Response.json({ error: "Set DREAMSCAPE_ADMIN_PASSWORD to at least 16 characters." }, { status: 503 });
  const ip = request.headers.get("x-nf-client-connection-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = createHash("sha256").update(ip).digest("hex");
  const now = Date.now();
  const previous = (await readJSON<{ attempts: number; until: number }>("dreamscape-login", key)).data;
  if (previous && previous.attempts >= 5 && previous.until > now) return Response.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  const body = await request.json().catch(() => null) as { password?: unknown } | null;
  if (typeof body?.password !== "string" || !validPassword(body.password)) {
    for (let i = 0; i < 5; i++) {
      const { data, etag } = await readJSON<{ attempts: number; until: number }>("dreamscape-login", key);
      const attempts = data?.until && data.until > now ? data.attempts + 1 : 1;
      const record = { attempts, until: now + 15 * 60 * 1000 };
      if (await writeJSON("dreamscape-login", key, record, etag)) break;
    }
    return Response.json({ error: "Incorrect password." }, { status: 401 });
  }
  await startSession();
  return Response.json({ authenticated: true });
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
  await endSession();
  return Response.json({ authenticated: false });
}
