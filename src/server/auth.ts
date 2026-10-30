import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "dreamscape_admin";
const SESSION_AGE = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.DREAMSCAPE_ADMIN_PASSWORD;
  if (!value || value.length < 16) return null;
  return value;
}

function sign(value: string, password: string) {
  return createHmac("sha256", password).update(value).digest("hex");
}

export function authConfigured() { return Boolean(secret()); }

export function validPassword(value: string) {
  const expected = secret();
  if (!expected) return false;
  const input = Buffer.from(sign(value, expected));
  const target = Buffer.from(sign(expected, expected));
  return timingSafeEqual(input, target);
}

export async function startSession() {
  const password = secret();
  if (!password) throw new Error("Admin password is not configured.");
  const payload = `${Date.now() + SESSION_AGE * 1000}.${randomBytes(16).toString("hex")}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload, password)}`, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: SESSION_AGE,
  });
}

export async function endSession() { (await cookies()).delete(COOKIE); }

export async function isAdmin() {
  const password = secret();
  const value = (await cookies()).get(COOKIE)?.value;
  if (!password || !value) return false;
  const parts = value.split(".");
  if (parts.length !== 3 || !/^\d+$/.test(parts[0]) || Number(parts[0]) < Date.now()) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const signature = Buffer.from(parts[2]);
  const expected = Buffer.from(sign(payload, password));
  return signature.length === expected.length && timingSafeEqual(signature, expected);
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const url = new URL(request.url);
  return origin === url.origin;
}
