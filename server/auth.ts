import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { Context } from "@netlify/functions";
import { and, eq, gt } from "drizzle-orm";
import { db } from "../db/index.js";
import { sessions } from "../db/schema.js";

export const SESSION_COOKIE = "mg_session";
const SESSION_HOURS = 8;

// Afiliados habilitados para ingresar al portal (la clave se guarda como hash SHA-256).
const AFILIADOS: Record<string, string> = {
  "1016949556": "f64561e04c3be9cea6271afcd2b324f4b8654ed1b011f4f15ff4436e0100d5a0",
};

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

export function credencialesValidas(cedula: string, clave: string) {
  const esperado = AFILIADOS[cedula];
  if (!esperado) return false;
  const a = Buffer.from(sha256(clave));
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function crearSesion(cedula: string, context: Context) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600 * 1000);
  await db.insert(sessions).values({ token, cedula, expiresAt });
  context.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    expires: expiresAt,
  });
}

export async function cerrarSesion(context: Context) {
  const token = context.cookies.get(SESSION_COOKIE);
  if (token) await db.delete(sessions).where(eq(sessions.token, token));
  context.cookies.delete({ name: SESSION_COOKIE, path: "/" });
}

/** Devuelve la cédula del afiliado autenticado, o null si no hay sesión válida. */
export async function afiliadoActual(context: Context): Promise<string | null> {
  const token = context.cookies.get(SESSION_COOKIE);
  if (!token) return null;
  const [s] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())));
  return s?.cedula ?? null;
}

export const noAutorizado = () =>
  Response.json({ error: "Sesión no válida. Ingrese nuevamente." }, { status: 401 });
